import { Injectable } from '@nestjs/common'
import { Typesense, TypesenseCollections } from '@wisemen/nestjs-typesense'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'

@Injectable()
export class MigrateCollectionsGroupCalculator {
  constructor (
    private collections: TypesenseCollections
  ) {}

  calculate (
    allNames: TypesenseCollectionName[],
    needsMigration: (name: TypesenseCollectionName) => boolean
  ): TypesenseCollectionName[][] {
    const reverse = this.buildReverseReferenceMap(allNames)

    const roots = allNames.filter(needsMigration)
    const assigned = new Set<TypesenseCollectionName>()
    const groups: TypesenseCollectionName[][] = []

    for (const root of roots) {
      if (assigned.has(root)) {
        continue
      }

      const group = this.getAffectedCollections(root, reverse)

      for (const name of group) {
        assigned.add(name)
      }

      groups.push([...group])
    }

    return groups
  }

  private buildReverseReferenceMap (
    names: TypesenseCollectionName[]
  ): Map<TypesenseCollectionName, TypesenseCollectionName[]> {
    const reverse = new Map<TypesenseCollectionName, TypesenseCollectionName[]>()

    for (const name of names) {
      reverse.set(name, [])
    }

    for (const name of names) {
      const collection = this.collections.get(name)

      for (const fieldName in collection) {
        const field = collection[fieldName]
        if (field.reference === undefined) {
          continue
        }

        const referenced = Typesense.collectionName(
          field.reference.collection
        ) as TypesenseCollectionName

        if (!reverse.has(referenced)) {
          continue
        }

        reverse.get(referenced)?.push(name)
      }
    }

    return reverse
  }

  private getAffectedCollections (
    start: TypesenseCollectionName,
    reverse: Map<TypesenseCollectionName, TypesenseCollectionName[]>
  ): Set<TypesenseCollectionName> {
    const visited = new Set<TypesenseCollectionName>()
    const stack: TypesenseCollectionName[] = [start]

    while (stack.length > 0) {
      const current = stack.pop()

      if (current === undefined) {
        return visited
      }

      if (visited.has(current)) {
        continue
      }

      visited.add(current)

      for (const next of reverse.get(current) ?? []) {
        stack.push(next)
      }
    }

    return visited
  }
}
