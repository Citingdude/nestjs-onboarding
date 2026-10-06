import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'
import { isPublicContext } from '@wisemen/nestjs-auth'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor (
    private authContext: AuthContext
  ) {}

  canActivate (context: ExecutionContext): boolean {
    if (isPublicContext(context)) {
      return true
    }

    this.authContext.getAuthOrFail()

    return true
  }
}
