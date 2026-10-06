import { before, describe, it } from 'node:test'
import assert from 'assert'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { buildContentDispositionHeader } from '#src/modules/files/helpers/content-disposition.header.js'

describe('Content disposition header test unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('build content disposition header correctly for troublesome filename', () => {
    const fileName = 'DECOMPTE _ tableau décompte au vendeur (avec calculs)_21891843.pdf'
    const header = buildContentDispositionHeader(fileName)
    const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/)
    const legacyMatch = header.match(/filename="([^"]+)"/)

    expect(utf8Match).not.toBeNull()
    expect(legacyMatch).not.toBeNull()

    assert(utf8Match !== null)
    assert(legacyMatch !== null)

    const decodedUtf8Filename = decodeURIComponent(utf8Match[1])
    const legacyFilename = legacyMatch[1]

    expect(decodedUtf8Filename).toBe(fileName.normalize())
    expect(legacyFilename).toBe('DECOMPTE _ tableau decompte au vendeur (avec calculs)_21891843.pdf')
  })
})
