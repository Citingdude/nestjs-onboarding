import type { OnApplicationBootstrap } from '@nestjs/common'
import { HttpStatus, Injectable, Logger, VERSION_NEUTRAL } from '@nestjs/common'
import { PARAMTYPES_METADATA } from '@nestjs/common/constants.js'
import { METHOD_METADATA, PATH_METADATA, ROUTE_ARGS_METADATA, VERSION_METADATA } from '@nestjs/common/constants.js'
import { RequestMethod } from '@nestjs/common/enums/request-method.enum.js'
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum.js'
import { DiscoveryService } from '@nestjs/core'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv'
import { IS_PUBLIC_KEY } from '@wisemen/nestjs-auth'
import { MCP_EMPTY_OUTPUT_SCHEMA } from './mcp-output.js'
import type { McpToolDefinition } from './mcp.types.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import { PERMISSIONS_KEY } from '#src/modules/auth/permission/permission.decorator.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { getMcpExclusion, isMcpExcluded } from '#src/modules/mcp/decorators/mcp-exclude.decorator.js'
import { getMcpTool } from '#src/modules/mcp/decorators/mcp-tool.decorator.js'
import { getRegisteredMcpExclusions, getRegisteredMcpTools } from '#src/modules/mcp/tool-policy/mcp-tool-registry.js'
import { AuthorizationService } from '#src/modules/auth/authorization/authorization.service.js'
import type { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

interface OpenApiParameter {
  name?: string
  in?: string
  required?: boolean
  type?: unknown
  isArray?: boolean
  schema?: Record<string, unknown>
  content?: Record<string, unknown>
  [key: string]: unknown
}

interface SwaggerPropertyMetadata extends Record<string, unknown> {
  name?: string
  type?: unknown
  required?: boolean
  isArray?: boolean
}

const SWAGGER_DECORATORS = {
  API_PARAMETERS: 'swagger/apiParameters',
  API_RESPONSE: 'swagger/apiResponse',
  API_MODEL_PROPERTIES: 'swagger/apiModelProperties',
  API_MODEL_PROPERTIES_ARRAY: 'swagger/apiModelPropertiesArray',
  API_EXCLUDE_ENDPOINT: 'swagger/apiExcludeEndpoint',
  API_EXCLUDE_CONTROLLER: 'swagger/apiExcludeController',
  API_SCHEMA: 'swagger/apiSchema'
} as const

const OPENAPI_METADATA_FACTORY_NAME = '_OPENAPI_METADATA_FACTORY'

@Injectable()
export class McpDiscoveryService implements OnApplicationBootstrap {
  private logger = new Logger(McpDiscoveryService.name)
  private jsonSchemaValidator = new AjvJsonSchemaValidator()
  private toolsByName = new Map<string, McpToolDefinition>()
  private unmatchedPolicyToolNames: string[] = []

  constructor (
    private discoveryService: DiscoveryService,
    private authzService: AuthorizationService
  ) {}

  onApplicationBootstrap (): void {
    this.buildTools()
  }

  getToolDefinition (name: string): McpToolDefinition | undefined {
    return this.toolsByName.get(name)
  }

  getUnmatchedPolicyToolNames (): readonly string[] {
    return this.unmatchedPolicyToolNames
  }

  async getToolsForPrincipal (principal: AuthPrincipal): Promise<Tool[]> {
    const permissionResult = await this.authzService.getPermissions(principal)

    return [...this.toolsByName.values()]
      .filter(definition =>
        this.hasPermissions(definition.requiredPermissions, permissionResult))
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(definition => ({
        name: definition.name,
        title: definition.title,
        description: definition.description,
        inputSchema: definition.inputSchema,
        ...(definition.outputSchema != null
          ? { outputSchema: definition.outputSchema }
          : {}),
        annotations: definition.annotations
      }))
  }

  hasPermissions (requiredPermissions: Permission[], permissionResult: PermissionSet): boolean {
    if (requiredPermissions.length === 0) {
      return true
    }

    return permissionResult.hasAny(requiredPermissions)
  }

  private buildTools (): void {
    this.toolsByName.clear()
    this.unmatchedPolicyToolNames = []

    const matchedPolicyToolNames = new Set<string>()

    const wrappers = this.discoveryService.getControllers() as unknown[]

    for (const wrapper of wrappers) {
      const wrapperRecord = this.asRecord(wrapper)
      const instance = this.asControllerInstance(wrapperRecord?.instance)
      const metatype = this.asCallable(wrapperRecord?.metatype)

      if (instance == null || metatype == null) {
        continue
      }

      const prototype = this.asRecord(Object.getPrototypeOf(instance))

      if (prototype == null) {
        continue
      }

      if (this.isSwaggerExcludedController(metatype)) {
        continue
      }

      if (isMcpExcluded(metatype)) {
        continue
      }

      const classPath = this.toPathSegments(Reflect.getMetadata(PATH_METADATA, metatype))
      const classVersionMetadata: unknown = Reflect.getMetadata(VERSION_METADATA, metatype)
      const methodNames = Object.getOwnPropertyNames(prototype)
        .filter(methodName => methodName !== 'constructor')
      for (const methodName of methodNames) {
        const handler = this.asCallable(prototype[methodName])

        if (handler == null) {
          continue
        }

        if (this.isSwaggerExcludedEndpoint(handler)) {
          continue
        }

        const exclusion = getMcpExclusion(handler)

        if (exclusion != null) {
          matchedPolicyToolNames.add(exclusion.name)
          continue
        }

        if (isMcpExcluded(handler)) {
          continue
        }

        const requestMethod = this.toHttpMethod(
          Reflect.getMetadata(METHOD_METADATA, handler)
        )

        if (requestMethod == null) {
          continue
        }

        const versions = this.normalizeVersions(
          Reflect.getMetadata(VERSION_METADATA, handler) ?? classVersionMetadata
        )
        const methodPath = this.toPathSegments(Reflect.getMetadata(PATH_METADATA, handler))
        const routeArgsMetadata = this.extractRouteArgsMetadata(instance, handler, methodName)
        const requiredPermissions = this.asPermissions(
          Reflect.getMetadata(PERMISSIONS_KEY, handler)
          ?? Reflect.getMetadata(PERMISSIONS_KEY, metatype)
          ?? []
        )
        const isPublic = this.asBoolean(
          Reflect.getMetadata(IS_PUBLIC_KEY, handler)
          ?? Reflect.getMetadata(IS_PUBLIC_KEY, metatype)
          ?? false
        )

        /**
          * Public routes serve anonymous callers. This connector acts for a signed-in user, and
          * McpExecutor skips authorization outright for a public route with no permissions.
          *
          * Hidden rather than removed: an anonymous connector may want these routes behind its
          * own audience and authentication model.
          */
        if (isPublic) {
          continue
        }

        for (const version of versions) {
          const routePath = this.toRoutePath(classPath, methodPath, version)
          const registeredTool = getMcpTool(handler)

          if (registeredTool == null) {
            continue
          }

          const { name: toolName, policy } = registeredTool
          matchedPolicyToolNames.add(toolName)
          const inputSchema = this.buildInputSchema(
            instance,
            prototype,
            handler,
            methodName,
            routeArgsMetadata
          )
          const outputSchema = this.buildOutputSchema(handler, toolName)

          const toolDefinition: McpToolDefinition = {
            name: toolName,
            title: policy.title,
            description: policy.description,
            method: requestMethod,
            routePath,
            inputSchema,
            ...(outputSchema != null ? { outputSchema } : {}),
            annotations: policy.annotations,
            requiredPermissions,
            allowedHeaderNames: this.getAllowedHeaderNames(inputSchema)
          }

          if (this.toolsByName.has(toolName)) {
            throw new Error(`Duplicate MCP tool name "${toolName}" discovered.`)
          }

          this.toolsByName.set(toolName, toolDefinition)
        }
      }
    }

    const registeredPolicyToolNames = [
      ...getRegisteredMcpTools().map(tool => tool.name),
      ...getRegisteredMcpExclusions().map(exclusion => exclusion.name)
    ]

    this.unmatchedPolicyToolNames = registeredPolicyToolNames
      .filter(toolName => !matchedPolicyToolNames.has(toolName))
      .sort()

    if (this.unmatchedPolicyToolNames.length > 0) {
      throw new Error(
        `MCP tool policies without a matching route: ${this.unmatchedPolicyToolNames.join(', ')}`
      )
    }

    this.logger.log(`MCP discovery completed with ${this.toolsByName.size} tools.`)
  }

  private buildInputSchema (
    instance: Record<string, unknown>,
    prototype: Record<string, unknown>,
    handler: (...args: unknown[]) => unknown,
    methodName: string,
    routeArgsMetadata: Record<string, unknown>
  ): Tool['inputSchema'] {
    const schemas: Record<string, Record<string, unknown>> = {}
    const parametersMetadata = this.exploreApiParametersMetadata(
      schemas,
      instance,
      prototype,
      handler,
      methodName,
      routeArgsMetadata
    )

    const rootProperties: Record<string, object> = {}
    const rootRequired: string[] = []

    const pathProperties: Record<string, object> = {}
    const pathRequired: string[] = []
    const queryProperties: Record<string, object> = {}
    const queryRequired: string[] = []
    const headerProperties: Record<string, object> = {}
    const headerRequired: string[] = []

    for (const parameter of this.asParameters(parametersMetadata?.parameters)) {
      const parameterName = this.asString(parameter.name)
      const parameterIn = this.asString(parameter.in)
      const schema = this.toParameterSchema(parameter, schemas)

      if (parameterIn == null || schema == null) {
        continue
      }

      if (parameterIn === 'body') {
        rootProperties.body = schema
        if (parameter.required === true) {
          rootRequired.push('body')
        }
        continue
      }

      if (parameterName == null) {
        continue
      }

      if (parameterIn === 'path') {
        pathProperties[parameterName] = schema
        if (parameter.required === true) {
          pathRequired.push(parameterName)
        }
      }

      if (parameterIn === 'query') {
        queryProperties[parameterName] = schema
        if (parameter.required === true) {
          queryRequired.push(parameterName)
        }
      }

      if (parameterIn === 'header') {
        headerProperties[parameterName] = schema
        if (parameter.required === true) {
          headerRequired.push(parameterName)
        }
      }
    }

    if (Object.keys(pathProperties).length > 0) {
      rootProperties.path = {
        type: 'object',
        properties: pathProperties,
        ...(pathRequired.length > 0 ? { required: pathRequired } : {})
      }
      rootRequired.push('path')
    }

    if (Object.keys(queryProperties).length > 0) {
      rootProperties.query = {
        type: 'object',
        properties: queryProperties,
        ...(queryRequired.length > 0 ? { required: queryRequired } : {})
      }
    }

    if (Object.keys(headerProperties).length > 0) {
      rootProperties.headers = {
        type: 'object',
        properties: headerProperties,
        ...(headerRequired.length > 0 ? { required: headerRequired } : {})
      }
    }

    const definitions = this.rewriteSchemaReferences(schemas)
    const schema = {
      type: 'object',
      properties: rootProperties,
      ...(rootRequired.length > 0 ? { required: rootRequired } : {})
    }

    return this.inlineSchemaReferences(schema, definitions) as Tool['inputSchema']
  }

  private buildOutputSchema (
    handler: (...args: unknown[]) => unknown,
    toolName: string
  ): Tool['outputSchema'] | undefined {
    const responses = this.asRecord(
      Reflect.getMetadata(SWAGGER_DECORATORS.API_RESPONSE, handler)
    ) ?? {}
    const successfulResponses = Object.entries(responses)
      .filter(([status]) => {
        const statusCode = Number.parseInt(status, 10)

        return statusCode >= HttpStatus.OK && statusCode < HttpStatus.AMBIGUOUS
      })

    if (successfulResponses.length === 0) {
      return undefined
    }

    if (successfulResponses.length > 1) {
      throw new Error(
        `MCP tool "${toolName}" has multiple successful Swagger responses; its output schema is ambiguous.`
      )
    }

    const response = this.asRecord(successfulResponses[0]?.[1])

    if (response?.type == null) {
      return MCP_EMPTY_OUTPUT_SCHEMA
    }

    const typeMetadata = this.resolveTypeMetadata(response?.type, response?.isArray === true)

    if (typeMetadata.isArray) {
      return undefined
    }

    const schemas: Record<string, Record<string, unknown>> = {}
    const schema = this.createSchemaFromType(typeMetadata.type, schemas)
    const definitions = this.rewriteSchemaReferences(schemas)
    const outputSchema = this.asRecord(this.inlineSchemaReferences(schema, definitions))

    if (outputSchema?.type !== 'object') {
      return undefined
    }

    try {
      this.jsonSchemaValidator.getValidator(outputSchema)
    } catch (error) {
      this.logger.warn(
        `MCP tool "${toolName}" has an invalid Swagger response schema; structured output is disabled.`,
        error instanceof Error ? error.message : undefined
      )

      return undefined
    }

    return outputSchema as NonNullable<Tool['outputSchema']>
  }

  private getAllowedHeaderNames (inputSchema: Tool['inputSchema']): string[] {
    const properties = this.asRecord(inputSchema.properties)
    const headers = this.asRecord(properties?.headers)
    const headerProperties = this.asRecord(headers?.properties)

    return Object.keys(headerProperties ?? {}).map(name => name.toLowerCase())
  }

  private exploreApiParametersMetadata (
    schemas: Record<string, Record<string, unknown>>,
    instance: Record<string, unknown>,
    prototype: Record<string, unknown>,
    handler: (...args: unknown[]) => unknown,
    methodName: string,
    routeArgsMetadata: Record<string, unknown>
  ): {
    parameters?: OpenApiParameter[]
  } | undefined {
    const explicitParameters = this.asParameters(
      Reflect.getMetadata(SWAGGER_DECORATORS.API_PARAMETERS, handler)
    )
    const reflectedParameters = this.reflectRouteParameters(
      instance,
      prototype,
      methodName,
      routeArgsMetadata
    )
    const hasNoParameters = explicitParameters.length === 0 && reflectedParameters.length === 0

    if (hasNoParameters) {
      return undefined
    }

    let properties = this.expandModelParameters(reflectedParameters)

    if (explicitParameters.length > 0) {
      properties = this.removeImplicitBodyParameterWhenExplicitExists(
        properties,
        explicitParameters
      )
      properties = properties.map(property => ({
        ...property,
        ...this.findExplicitParameterMatch(property, explicitParameters)
      }))
      properties = this.mergeUniqueParameters(properties, explicitParameters)
    }

    const parameters = properties
      .map(parameter => this.toOpenApiParameter(parameter, schemas))
      .filter((parameter): parameter is OpenApiParameter => parameter != null)

    return parameters.length > 0 ? { parameters } : undefined
  }

  private toParameterSchema (
    parameter: OpenApiParameter,
    schemas: Record<string, Record<string, unknown>>
  ): Record<string, unknown> | undefined {
    if (parameter.schema != null) {
      return this.rewriteReferences(parameter.schema) as Record<string, unknown>
    }

    const content = this.asRecord(parameter.content)

    if (content == null) {
      return undefined
    }

    const mediaType = this.asRecord(content['application/json'])
      ?? this.asRecord(content['application/*+json'])
      ?? this.asRecord(content['*/*'])

    if (mediaType == null) {
      return undefined
    }

    const mediaSchema = this.asRecord(mediaType.schema)

    if (mediaSchema == null) {
      return undefined
    }

    return this.rewriteReferences(mediaSchema, schemas) as Record<string, unknown>
  }

  private reflectRouteParameters (
    _instance: Record<string, unknown>,
    prototype: Record<string, unknown>,
    methodName: string,
    routeArgsMetadata: Record<string, unknown>
  ): OpenApiParameter[] {
    const paramTypes = Reflect.getMetadata(
      PARAMTYPES_METADATA,
      prototype,
      methodName
    ) as unknown[] | undefined

    if (paramTypes == null || paramTypes.length === 0) {
      return []
    }

    return Object.entries(routeArgsMetadata)
      .map(([key, metadata]) => this.toImplicitParameter(key, metadata, paramTypes))
      .filter((parameter): parameter is OpenApiParameter => parameter != null)
  }

  private toImplicitParameter (
    key: string,
    metadata: unknown,
    paramTypes: unknown[]
  ): OpenApiParameter | undefined {
    const metadataRecord = this.asRecord(metadata)

    if (metadataRecord == null) {
      return undefined
    }

    const [rawType, rawIndex] = key.split(':')
    const index = typeof metadataRecord.index === 'number'
      ? metadataRecord.index
      : Number.parseInt(rawIndex ?? '0', 10)
    const routeParamType = typeof metadataRecord.type === 'number'
      ? metadataRecord.type
      : Number.parseInt(rawType ?? '0', 10)
    const parameterIn = this.toParameterLocation(routeParamType)

    if (parameterIn == null) {
      return undefined
    }

    return {
      type: paramTypes[index],
      name: this.asString(metadataRecord.data),
      required: true,
      in: parameterIn
    }
  }

  private toParameterLocation (routeParamType: number): string | undefined {
    switch (routeParamType) {
      case RouteParamtypes.BODY:
        return 'body'
      case RouteParamtypes.PARAM:
        return 'path'
      case RouteParamtypes.QUERY:
        return 'query'
      case RouteParamtypes.HEADERS:
        return 'header'
      default:
        return undefined
    }
  }

  private expandModelParameters (parameters: OpenApiParameter[]): OpenApiParameter[] {
    return parameters.flatMap((parameter) => {
      if (parameter.type == null || parameter.type === Object) {
        return []
      }

      if (parameter.name != null) {
        return [parameter]
      }

      if (parameter.in === 'body') {
        const typeName = typeof parameter.type === 'function'
          ? parameter.type.name
          : this.asString(parameter.type)

        return [{
          ...parameter,
          ...(typeName != null ? { name: typeName } : {})
        }]
      }

      if (typeof parameter.type !== 'function') {
        return [parameter]
      }

      const modelType = this.asCallable(parameter.type)

      if (modelType == null) {
        return [parameter]
      }

      return this.getModelProperties(modelType).map(property => ({
        ...parameter,
        ...property,
        name: this.asString(property.name) ?? this.asString(parameter.name)
      }))
    })
  }

  private getModelProperties (
    modelType: (...args: unknown[]) => unknown
  ): SwaggerPropertyMetadata[] {
    const prototype = this.asRecord(modelType.prototype)

    if (prototype == null) {
      return []
    }

    const prototypes: Record<string, unknown>[] = []
    let current: Record<string, unknown> | undefined = prototype

    while (current != null && current !== Object.prototype) {
      prototypes.unshift(current)
      current = this.asRecord(Reflect.getPrototypeOf(current))
    }

    const properties = new Map<string, SwaggerPropertyMetadata>()

    for (const currentPrototype of prototypes) {
      for (const [propertyName, metadata] of Object.entries(
        this.getOpenApiMetadataFactory(currentPrototype)
      )) {
        const existing = properties.get(propertyName) ?? {}

        properties.set(propertyName, {
          ...existing,
          ...metadata,
          name: propertyName
        })
      }

      const propertyKeys = Reflect.getMetadata(
        SWAGGER_DECORATORS.API_MODEL_PROPERTIES_ARRAY,
        currentPrototype
      ) as unknown

      if (!Array.isArray(propertyKeys)) {
        continue
      }

      for (const key of propertyKeys) {
        if (typeof key !== 'string' || key.startsWith(':') === false) {
          continue
        }

        const propertyName = key.slice(1)
        const metadata = this.asRecord(
          Reflect.getMetadata(
            SWAGGER_DECORATORS.API_MODEL_PROPERTIES,
            currentPrototype,
            propertyName
          )
        ) ?? {}
        const existing = properties.get(propertyName) ?? {}

        properties.set(propertyName, {
          ...existing,
          ...metadata,
          name: this.asString(metadata.name) ?? propertyName
        })
      }
    }

    return [...properties.values()]
  }

  private getOpenApiMetadataFactory (
    prototype: Record<string, unknown>
  ): Record<string, SwaggerPropertyMetadata> {
    const constructorRecord = this.asRecord(prototype.constructor)

    if (constructorRecord == null) {
      return {}
    }

    const metadataFactory = this.asCallable(
      constructorRecord[OPENAPI_METADATA_FACTORY_NAME]
    )

    if (metadataFactory == null) {
      return {}
    }

    const metadata = this.asRecord(metadataFactory.call(prototype.constructor))

    if (metadata == null) {
      return {}
    }

    const entries = Object.entries(metadata)
      .map(([propertyName, value]) => [propertyName, this.asRecord(value)] as const)
      .filter((entry): entry is readonly [string, Record<string, unknown>] => entry[1] != null)

    return Object.fromEntries(entries)
  }

  private removeImplicitBodyParameterWhenExplicitExists (
    properties: OpenApiParameter[],
    explicitParameters: OpenApiParameter[]
  ): OpenApiParameter[] {
    const hasImplicitBody = properties.some(parameter => parameter.in === 'body')
    const hasExplicitBody = explicitParameters.some(parameter => parameter.in === 'body')

    if (!hasImplicitBody || !hasExplicitBody) {
      return properties
    }

    return properties.filter(parameter => parameter.in !== 'body')
  }

  private findExplicitParameterMatch (
    property: OpenApiParameter,
    explicitParameters: OpenApiParameter[]
  ): OpenApiParameter | undefined {
    return explicitParameters.find(parameter =>
      parameter.name === property.name
      && parameter.in === property.in
    )
  }

  private mergeUniqueParameters (
    implicitParameters: OpenApiParameter[],
    explicitParameters: OpenApiParameter[]
  ): OpenApiParameter[] {
    const merged = [...implicitParameters]

    for (const explicitParameter of explicitParameters) {
      const exists = merged.some(parameter =>
        parameter.name === explicitParameter.name
        && parameter.in === explicitParameter.in
      )

      if (!exists) {
        merged.push(explicitParameter)
      }
    }

    return merged
  }

  private toOpenApiParameter (
    parameter: OpenApiParameter,
    schemas: Record<string, Record<string, unknown>>
  ): OpenApiParameter | undefined {
    if (parameter.schema != null || parameter.content != null) {
      return parameter
    }

    const schema = this.createSchemaForParameter(parameter, schemas)

    if (schema == null) {
      return undefined
    }

    return {
      ...parameter,
      schema
    }
  }

  private createSchemaForParameter (
    parameter: OpenApiParameter,
    schemas: Record<string, Record<string, unknown>>
  ): Record<string, unknown> | undefined {
    const typeMetadata = this.resolveTypeMetadata(parameter.type, parameter.isArray === true)
    const enumValues = Array.isArray(parameter.enum) ? parameter.enum : undefined
    let schema = enumValues != null
      ? {
          type: this.inferEnumType(enumValues),
          enum: enumValues
        }
      : this.createSchemaFromType(typeMetadata.type, schemas)

    if (schema == null) {
      return undefined
    }

    if (typeMetadata.isArray) {
      schema = {
        type: 'array',
        items: schema
      }
    }

    const schemaOptions = this.extractSchemaOptions(parameter)

    return {
      ...schema,
      ...schemaOptions
    }
  }

  private resolveTypeMetadata (
    value: unknown,
    isArray: boolean
  ): { type: unknown, isArray: boolean } {
    if (Array.isArray(value)) {
      return {
        type: value[0],
        isArray: true
      }
    }

    const lazyTypeFactory = this.asCallable(value)

    if (lazyTypeFactory != null && lazyTypeFactory.prototype == null) {
      const resolved = lazyTypeFactory()

      if (Array.isArray(resolved)) {
        return {
          type: resolved[0],
          isArray: true
        }
      }

      return {
        type: resolved,
        isArray
      }
    }

    return {
      type: value,
      isArray
    }
  }

  private createSchemaFromType (
    value: unknown,
    schemas: Record<string, Record<string, unknown>>
  ): Record<string, unknown> | undefined {
    if (value == null) {
      return undefined
    }

    if (typeof value === 'string') {
      return { type: value }
    }

    if (value === String) {
      return { type: 'string' }
    }

    if (value === Number) {
      return { type: 'number' }
    }

    if (value === Boolean) {
      return { type: 'boolean' }
    }

    if (value === Date) {
      return {
        type: 'string',
        format: 'date-time'
      }
    }

    if (value === BigInt) {
      return {
        type: 'integer',
        format: 'int64'
      }
    }

    if (value === Array) {
      return {
        type: 'array',
        items: {}
      }
    }

    if (typeof value !== 'function') {
      return undefined
    }

    const modelType = this.asCallable(value)

    if (modelType == null) {
      return undefined
    }

    const schemaName = this.ensureModelSchema(modelType, schemas)

    return schemaName.length > 0
      ? { $ref: `#/$defs/${schemaName}` }
      : undefined
  }

  private ensureModelSchema (
    modelType: (...args: unknown[]) => unknown,
    schemas: Record<string, Record<string, unknown>>
  ): string {
    const schemaName = this.getSchemaName(modelType)

    if (schemaName.length === 0 || schemas[schemaName] != null) {
      return schemaName
    }

    schemas[schemaName] = {
      type: 'object',
      properties: {}
    }

    const properties = this.getModelProperties(modelType)
    const schemaProperties: Record<string, unknown> = {}
    const required: string[] = []

    for (const property of properties) {
      const propertyName = this.asString(property.name)

      if (propertyName == null) {
        continue
      }

      const propertySchema = this.createSchemaForProperty(property, schemas)

      if (propertySchema == null) {
        continue
      }

      schemaProperties[propertyName] = propertySchema

      if (property.required !== false) {
        required.push(propertyName)
      }
    }

    schemas[schemaName] = {
      type: 'object',
      properties: schemaProperties,
      ...(required.length > 0 ? { required } : {})
    }

    return schemaName
  }

  private createSchemaForProperty (
    property: SwaggerPropertyMetadata,
    schemas: Record<string, Record<string, unknown>>
  ): Record<string, unknown> | undefined {
    const typeMetadata = this.resolveTypeMetadata(property.type, property.isArray === true)
    const enumValues = Array.isArray(property.enum) ? property.enum : undefined
    let schema = enumValues != null
      ? {
          type: this.inferEnumType(enumValues),
          enum: enumValues
        }
      : this.createSchemaFromType(typeMetadata.type, schemas)

    if (schema == null) {
      return undefined
    }

    if (typeMetadata.isArray) {
      schema = {
        type: 'array',
        items: schema
      }
    }

    const schemaOptions = this.extractSchemaOptions(property)

    return {
      ...schema,
      ...schemaOptions
    }
  }

  private extractSchemaOptions (value: Record<string, unknown>): Record<string, unknown> {
    const schemaOptions = { ...value }

    delete schemaOptions.name
    delete schemaOptions.in
    delete schemaOptions.required
    delete schemaOptions.type
    delete schemaOptions.isArray
    delete schemaOptions.enumName
    delete schemaOptions.content
    delete schemaOptions.schema

    return this.rewriteReferences(schemaOptions) as Record<string, unknown>
  }

  private inferEnumType (values: unknown[]): string {
    const hasNumberValue = values.some(value => typeof value === 'number')

    return hasNumberValue ? 'number' : 'string'
  }

  private getSchemaName (modelType: (...args: unknown[]) => unknown): string {
    const metadata: unknown = Reflect.getMetadata(
      SWAGGER_DECORATORS.API_SCHEMA,
      modelType
    )

    if (Array.isArray(metadata)) {
      const lastSchema: unknown = metadata.at(-1)
      const schemaName = this.asString(this.asRecord(lastSchema)?.name)

      if (schemaName != null) {
        return schemaName
      }
    }

    return modelType.name
  }

  private rewriteSchemaReferences (
    schemas: Record<string, Record<string, unknown>>
  ): Record<string, Record<string, unknown>> {
    const rewritten: Record<string, Record<string, unknown>> = {}

    for (const [schemaName, schema] of Object.entries(schemas)) {
      rewritten[schemaName] = this.rewriteReferences(schema, schemas) as Record<string, unknown>
    }

    return rewritten
  }

  private rewriteReferences (
    value: unknown,
    schemas?: Record<string, Record<string, unknown>>
  ): unknown {
    if (Array.isArray(value)) {
      return value.map(item => this.rewriteReferences(item, schemas))
    }

    const record = this.asRecord(value)

    if (record == null) {
      return value
    }

    const rewritten: Record<string, unknown> = {}

    for (const [key, nestedValue] of Object.entries(record)) {
      if (key === '$ref' && typeof nestedValue === 'string') {
        rewritten[key] = nestedValue.replace('#/components/schemas/', '#/$defs/')
        continue
      }

      rewritten[key] = this.rewriteReferences(nestedValue, schemas)
    }

    return rewritten
  }

  private inlineSchemaReferences (
    value: unknown,
    definitions: Record<string, Record<string, unknown>>,
    activeRefs: string[] = []
  ): unknown {
    if (Array.isArray(value)) {
      return value.map(item => this.inlineSchemaReferences(item, definitions, activeRefs))
    }

    const record = this.asRecord(value)

    if (record == null) {
      return value
    }

    const ref = this.asString(record.$ref)

    if (ref != null && ref.startsWith('#/$defs/')) {
      const definitionName = ref.replace('#/$defs/', '')
      const definition = definitions[definitionName]

      if (definition == null || activeRefs.includes(definitionName)) {
        return value
      }

      const { $ref: _ref, ...rest } = record
      const inlinedDefinition = this.inlineSchemaReferences(
        definition,
        definitions,
        [...activeRefs, definitionName]
      )
      const inlinedRest = this.inlineSchemaReferences(rest, definitions, activeRefs)
      const inlinedDefinitionRecord = this.asRecord(inlinedDefinition) ?? {}
      const inlinedRestRecord = this.asRecord(inlinedRest) ?? {}

      return {
        ...inlinedDefinitionRecord,
        ...inlinedRestRecord
      }
    }

    const inlinedRecord: Record<string, unknown> = {}

    for (const [key, nestedValue] of Object.entries(record)) {
      inlinedRecord[key] = this.inlineSchemaReferences(nestedValue, definitions, activeRefs)
    }

    return inlinedRecord
  }

  private isSwaggerExcludedController (metatype: (...args: unknown[]) => unknown): boolean {
    const metadata: unknown = Reflect.getMetadata(
      SWAGGER_DECORATORS.API_EXCLUDE_CONTROLLER,
      metatype
    )

    return Array.isArray(metadata) && metadata[0] === true
  }

  private isSwaggerExcludedEndpoint (handler: (...args: unknown[]) => unknown): boolean {
    const metadata: unknown = Reflect.getMetadata(
      SWAGGER_DECORATORS.API_EXCLUDE_ENDPOINT,
      handler
    )

    return metadata === true
  }

  private normalizeVersions (versionMetadata: unknown): Array<string | undefined> {
    if (versionMetadata == null || versionMetadata === VERSION_NEUTRAL) {
      return [undefined]
    }

    if (Array.isArray(versionMetadata)) {
      const versions = versionMetadata.map((version) => {
        if (version === VERSION_NEUTRAL) {
          return undefined
        }

        return typeof version === 'string' ? version : undefined
      })

      return versions.length > 0 ? versions : [undefined]
    }

    return typeof versionMetadata === 'string'
      ? [versionMetadata]
      : [undefined]
  }

  private toPathSegments (value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.flatMap(segment => this.toPathSegments(segment))
    }

    if (typeof value !== 'string') {
      return []
    }

    return value
      .split('/')
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0)
  }

  private toRoutePath (
    classPath: string[],
    methodPath: string[],
    version: string | undefined
  ): string {
    const segments = version == null
      ? [...classPath, ...methodPath]
      : [`v${version}`, ...classPath, ...methodPath]

    return '/' + segments.join('/')
  }

  private extractRouteArgsMetadata (
    instance: Record<string, unknown>,
    handler: (...args: unknown[]) => unknown,
    methodName: string
  ): Record<string, unknown> {
    const metadata = this.asRecord(Reflect.getMetadata(ROUTE_ARGS_METADATA, handler))
      ?? this.asRecord(
        Reflect.getMetadata(ROUTE_ARGS_METADATA, instance.constructor, methodName)
      )
      ?? {}

    if (Object.keys(metadata).length > 0) {
      return metadata
    }

    const instanceMethod = instance[methodName]

    if (typeof instanceMethod !== 'function') {
      return {}
    }

    return this.asRecord(Reflect.getMetadata(ROUTE_ARGS_METADATA, instanceMethod)) ?? {}
  }

  private toHttpMethod (value: unknown): string | undefined {
    switch (value) {
      case RequestMethod.GET:
        return 'get'
      case RequestMethod.POST:
        return 'post'
      case RequestMethod.PUT:
        return 'put'
      case RequestMethod.DELETE:
        return 'delete'
      case RequestMethod.PATCH:
        return 'patch'
      case RequestMethod.OPTIONS:
        return 'options'
      case RequestMethod.HEAD:
        return 'head'
      case RequestMethod.ALL:
        return 'all'
      default:
        return undefined
    }
  }

  private asControllerInstance (value: unknown): Record<string, unknown> | undefined {
    if (typeof value === 'object' && value != null) {
      return value as Record<string, unknown>
    }

    return undefined
  }

  private asCallable (value: unknown): ((...args: unknown[]) => unknown) | undefined {
    if (typeof value === 'function') {
      return value as (...args: unknown[]) => unknown
    }

    return undefined
  }

  private asRecord (value: unknown): Record<string, unknown> | undefined {
    if (typeof value === 'object' && value != null && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }

    return undefined
  }

  private asString (value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined
  }

  private asParameters (value: unknown): OpenApiParameter[] {
    if (!Array.isArray(value)) {
      return []
    }

    return value
      .map(parameter => this.asRecord(parameter))
      .filter((parameter): parameter is OpenApiParameter => parameter != null)
  }

  private asBoolean (value: unknown): boolean {
    return value === true
  }

  private asPermissions (value: unknown): Permission[] {
    if (!Array.isArray(value)) {
      return []
    }
    return value.filter((permission): permission is Permission => typeof permission === 'string')
  }
}
