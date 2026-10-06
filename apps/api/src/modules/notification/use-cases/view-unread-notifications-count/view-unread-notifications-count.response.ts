import { ApiProperty } from '@nestjs/swagger'

export class ViewUnreadNotificationsCountResponse {
  @ApiProperty({ type: 'number', minimum: 0 })
  amount: number

  @ApiProperty({ type: 'boolean' })
  exceedsLimit: boolean

  constructor (amount: number, exceedsLimit: boolean) {
    this.amount = amount
    this.exceedsLimit = exceedsLimit
  }
}
