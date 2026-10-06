import { ValidationPipe } from '@nestjs/common'
import { convertClassValidatorErrorsToJsonApiError } from '@wisemen/api-error'

export class CustomValidationPipe extends ValidationPipe {
  constructor () {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: errors => convertClassValidatorErrorsToJsonApiError(errors)
    })
  }
}
