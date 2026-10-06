import { Global, Module } from '@nestjs/common'
import { AuthorizationServiceModule } from '#src/modules/auth/authorization/authorization.service.module.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Global()
@Module({
  imports: [AuthorizationServiceModule],
  providers: [AuthContext],
  exports: [AuthContext]
})
export class AuthContextModule {}
