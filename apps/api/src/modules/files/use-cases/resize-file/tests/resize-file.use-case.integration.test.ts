import { before, describe, it, after, mock } from 'node:test'
import assert from 'assert'
import type { DataSource } from 'typeorm'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { ResizeFileUseCase } from '#src/modules/files/use-cases/resize-file/resize-file.use-case.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { ResizeFileVariant } from '#src/modules/files/use-cases/resize-file/job/resize-file.job.js'
import { ImageResizer } from '#src/modules/image-resize/image-resizer.js'
import { SystemQueueModule } from '#src/modules/queue-modules/system-queue.module.js'

describe('Resize file use case integration tests', () => {
  let setup: TestSetup
  let dataSource: DataSource
  let useCase: ResizeFileUseCase

  before(async () => {
    setup = await TestBench.setupModuleTest(SystemQueueModule)
    dataSource = setup.dataSource
    useCase = setup.app.get(ResizeFileUseCase)
  })

  after(async () => await setup.teardown())

  it('resize file', async () => {
    const file = new FileBuilder().build()

    await dataSource.manager.insert(File, file)

    const variants: ResizeFileVariant[] = [
      {
        label: 'thumbnail',
        width: 100,
        height: 100
      }
    ]

    const resizeMock = mock.method(ImageResizer.prototype, 'resize', async () => Promise.resolve())

    await useCase.execute(file.uuid, variants)

    resizeMock.mock.restore()

    const updatedFile = await dataSource.manager.findOneBy(File, { uuid: file.uuid })

    expect(updatedFile).not.toBeNull()
    assert(updatedFile !== null)
    expect(updatedFile.variants).toHaveLength(1)
    expect(updatedFile.variants[0].label).toEqual('thumbnail')
  })

  it('resize file with existing variants', async () => {
    const file = new FileBuilder()
      .withVariants([{ label: 'large' }])
      .build()

    await dataSource.manager.insert(File, file)

    const variants: ResizeFileVariant[] = [
      {
        label: 'thumbnail',
        width: 100,
        height: 100
      },
      {
        label: 'medium',
        width: 500,
        height: 500
      }
    ]

    const resizeMock = mock.method(ImageResizer.prototype, 'resize', async () => Promise.resolve())

    await useCase.execute(file.uuid, variants)

    resizeMock.mock.restore()

    const updatedFile = await dataSource.manager.findOneBy(File, { uuid: file.uuid })

    expect(updatedFile).not.toBeNull()
    assert(updatedFile !== null)
    expect(updatedFile.variants).toHaveLength(3)
    expect(updatedFile.variants.map(v => v.label)).toEqual(expect.arrayContaining(['large', 'thumbnail', 'medium']))
  })
})
