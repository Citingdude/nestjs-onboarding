/**
 * How this server identifies itself in the MCP `initialize` result. A client displays the name
 * next to every tool call it makes, so it should read as the product, not as the deployment.
 *
 * Rename these when initializing a project.
 */
export const MCP_SERVER_NAME = 'NestJS Project Template'
export const MCP_SERVER_VERSION = '0.1.0'

/**
 * A public https URL to an SVG, or undefined to advertise no icon. It is fetched by the client
 * from outside the API, so it cannot be an authenticated route.
 */
export const MCP_SERVER_ICON_URL: string | undefined = undefined
