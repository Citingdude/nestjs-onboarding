import { join } from 'node:path'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypesenseModule as ClientModule } from '@wisemen/nestjs-typesense'

@Module({
  imports: [ClientModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (cfg: ConfigService) => {
      return {
        nodes: [{
          host: cfg.get('TYPESENSE_HOST', ''),
          port: 8108,
          protocol: 'http'
        }],
        apiKey: cfg.get('TYPESENSE_KEY', ''),
        collectionsGlob: join(process.cwd(), 'dist', '**', 'typesense', '**', '*.typesense-collection.js')
      }
    }
  })],
  exports: [ClientModule]
})
export class TypesenseClientModule {}
