import { Injectable } from '@nestjs/common'
import type { Permission } from '@nats-io/jwt'
import { ConfigService } from '@nestjs/config'
import { natsSubject } from '@wisemen/nestjs-nats'
import { UserNotificationCreatedNatsSubject } from '#src/modules/notification/use-cases/send-app-notification/send-app-notification.integration.event.js'
import { ContactCreatedNatsSubject } from '#src/app/contact/use-cases/create-contact/integration/contact-created.integration.event.js'
import { ContactDeletedNatsSubject } from '#src/app/contact/use-cases/delete-contact/integration/contact-deleted.integration.event.js'
import { ContactUpdatedNatsSubject } from '#src/app/contact/use-cases/update-contact/integration/contact-updated.integration.event.js'
import { Permission as UserPermission } from '#src/modules/auth/permission/permission.enum.js'
import { ExportSucceededNatsSubject } from '#src/app/export/use-cases/emit-export-succeeded/export-succeeded.integration.event.js'
import { ExportFailedNatsSubject } from '#src/app/export/use-cases/emit-export-failed/export-failed.integration.event.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import { AuthorizationService } from '#src/modules/auth/authorization/authorization.service.js'
import type { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

export interface NatsPermissions {
  pub: Partial<Permission>
  sub: Partial<Permission>
}

type PermissionKey = UserPermission | '*'
type PermissionSubjects = Partial<Record<PermissionKey, string[]>>
interface NatsPermissionValues {
  pub: PermissionSubjects
  sub: PermissionSubjects
}

@Injectable()
export class AuthCalloutPermissions {
  constructor (
    private config: ConfigService,
    private authzService: AuthorizationService
  ) {}

  async getPermissionsFor (auth: AuthPrincipal): Promise<NatsPermissions> {
    const natsPermissions: NatsPermissionValues = {
      pub: {},
      sub: {
        '*': [
          natsSubject(UserNotificationCreatedNatsSubject, {
            env: this.config.getOrThrow('NODE_ENV'),
            userUuid: auth.userUuid,
            notificationUuid: '*'
          })
        ],
        [UserPermission.CONTACT_READ]: [
          natsSubject(ContactCreatedNatsSubject, {
            env: this.config.getOrThrow('NODE_ENV'),
            uuid: '*'
          }),
          natsSubject(ContactDeletedNatsSubject, {
            env: this.config.getOrThrow('NODE_ENV'),
            uuid: '*'
          }),
          natsSubject(ContactUpdatedNatsSubject, {
            env: this.config.getOrThrow('NODE_ENV'),
            uuid: '*'
          })
        ],
        [UserPermission.EXPORT_READ]: [
          natsSubject(ExportSucceededNatsSubject, {
            env: this.config.getOrThrow('NODE_ENV'),
            userUuid: auth.userUuid,
            exportUuid: '*'
          }),
          natsSubject(ExportFailedNatsSubject, {
            env: this.config.getOrThrow('NODE_ENV'),
            userUuid: auth.userUuid,
            exportUuid: '*'
          })
        ]
      }
    }

    const permissions = await this.authzService.getPermissions(auth)

    return {
      pub: {},
      sub: { allow: this.filterSubjects(natsPermissions.sub, permissions) }
    }
  }

  private filterSubjects (values: PermissionSubjects, permissions: PermissionSet): string[] {
    if (permissions.hasAllPermissions) {
      return Object.values(values).flat()
    }

    const resolved = new Set<string>()
    for (const [permission, subjects] of Object.entries(values)) {
      if (permission === '*' || permissions.hasAll([permission as UserPermission])) {
        subjects.forEach(subject => resolved.add(subject))
      }
    }

    return [...resolved]
  }
}
