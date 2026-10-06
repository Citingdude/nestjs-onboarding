import { Module } from '@nestjs/common'
import { ViewCollectionIndexUseCase } from './view-collection-index.use-case.js'
import { ViewCollectionIndexController } from './view-collection-index.controller.js'

@Module({
  imports: [],
  controllers: [
    ViewCollectionIndexController
  ],
  providers: [
    ViewCollectionIndexUseCase
  ]
})
export class ViewCollectionIndexModule { }
