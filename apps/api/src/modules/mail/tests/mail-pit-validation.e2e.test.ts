import { before, describe, it, after } from 'node:test'
import type { MailpitMessageListItem } from 'mailpit-api'
import { expect } from 'expect'
import { MailClient, type MailPitMailClient } from '@wisemen/nestjs-mail'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { DefaultMailModule } from '#src/modules/mail/default-mail.module.js'

describe('Mail pit validator test', () => {
  let setup: TestSetup
  let mailClient: MailPitMailClient

  const minSupportedScore = 75
  const forbiddenLinkSubstring = 'https://s3'

  before(async () => {
    setup = await TestBench.setupModuleTest(DefaultMailModule)
    mailClient = setup.app.get<MailPitMailClient>(MailClient)
  })

  after(async () => await setup.teardown())

  it('validate mails', async () => {
    for await (const messages of messagesGenerator()) {
      for (const message of messages) {
        const htmlResponse = await mailClient.client.htmlCheck(message.ID)
        expect(htmlResponse.Total.Supported).toBeGreaterThanOrEqual(minSupportedScore)

        const linkResponse = await mailClient.client.linkCheck(message.ID)
        for (const link of linkResponse.Links) {
          expect(link.URL).not.toContain(forbiddenLinkSubstring)
        }
      }
    }
  })

  async function* messagesGenerator (): AsyncGenerator<MailpitMessageListItem[], void, void> {
    let start = 0
    const limit = 40

    while (true) {
      const response = await mailClient.client.listMessages(start, limit)

      if (response.messages.length === 0) {
        break
      }

      yield response.messages
      start += response.messages.length
    }
  }
})
