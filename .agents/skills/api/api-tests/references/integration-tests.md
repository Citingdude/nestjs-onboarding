## Integration test example shape

Use when testing a use case which is not accessible through http.

```ts
import { after, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { DateTimeRange } from '@wisemen/datewise'
import { AddressBuilder } from '@wisemen/address'
import { Coordinates } from '@wisemen/coordinates'
import { ReplanShiftJob } from '#src/apps/planning/shift/use-cases/replan-shift/job/replan-shift.job.js'
import { AtoCanceledReason } from '#src/apps/order-management/accepted-transport-order/enums/ato-canceled-reason.js'
import { ReplanShiftJobHandler } from '#src/apps/planning/shift/use-cases/replan-shift/job/replan-shift.job-handler.js'
import { SystemQueueModule } from '#src/modules/queue-modules/system-queue.module.js'
import { PlanningTask } from '#src/apps/planning/planning-task/entities/planning-task.entity.js'
import { PlanningTaskBuilder } from '#src/apps/planning/planning-task/entities/planning-task.entity.builder.js'
import { PlannedTransportOrder } from '#src/apps/planning/planned-transport-order/entities/planned-transport-order.entity.js'
import { Shift } from '#src/apps/planning/shift/entities/shift.entity.js'
import { Allocation } from '#src/apps/resource-management/allocation/entities/allocation.entity.js'
import { AllocationBuilder } from '#src/apps/resource-management/allocation/entities/allocation.entity.builder.js'
import { AcceptedTransportOrder } from '#src/apps/order-management/accepted-transport-order/entities/accepted-transport-order.entity.js'
import { AcceptedTransportOrderBuilder } from '#src/apps/order-management/accepted-transport-order/builders/accepted-transport-order.entity.builder.js'
import { DriverSeeder } from '#src/apps/resource-management/driver/entities/driver/driver.seeder.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { BookingSeeder } from '#src/apps/order-management/booking/entities/booking.seeder.js'
import { CareUserSeeder } from '#src/apps/order-management/care-user/entities/care-user.seeder.js'
import { AllocationRuleSeeder } from '#src/apps/resource-management/allocation-rule/tests/allocation-rule.seeder.js'
import { PlannedTransportOrderBuilder } from '#src/apps/planning/planned-transport-order/entities/planned-transport-order.entity.builder.js'
import { ShiftBuilder } from '#src/apps/planning/shift/entities/shift.entity-builder.js'
import { PlanningSequence } from '#src/apps/planning/planning-sequence/entities/planning-sequence.entity.js'
import { PlanningSequenceBuilder } from '#src/apps/planning/planning-sequence/entities/planning-sequence.entity.builder.js'

describe('Replan shift - job integration test', () => {
  let setup: TestSetup
  let handler: ReplanShiftJobHandler

  before(async () => {
    setup = await TestBench.setupModuleTest(SystemQueueModule)
    handler = setup.app.get(ReplanShiftJobHandler, { strict: false })
  })

  after(async () => {
    await setup.teardown()
  })

  it('removes a shift from a driver with no assigned atos', async () => {
    const driver = await new DriverSeeder(setup.entityManager).seed()
    const allocationRule = await new AllocationRuleSeeder(setup.entityManager)
      .withDriver(driver)
      .seed()
    const allocation = new AllocationBuilder()
      .withAllocationRuleUuid(allocationRule.uuid)
      .withDriverUuid(driver.uuid)
      .withRange(new DateTimeRange('2025-01-01 10:00:00', '2025-01-01 18:00:00'))
      .build()
    await setup.entityManager.insert(Allocation, allocation)

    const careUser = await new CareUserSeeder(setup.entityManager).seed()
    const booking = await new BookingSeeder(setup.entityManager).seed()

    const ato = new AcceptedTransportOrderBuilder()
      .withCareUserUuid(careUser.uuid)
      .withBookingUuid(booking.uuid)
      .withClientId(booking.clientId)
      .withContractUuid(booking.contractUuid)
      .withTargetTime(new Date('2025-01-01 12:00:00'))
      .withCancelReason(AtoCanceledReason.CANCELED_BY_TH)
      .build()
    await setup.entityManager.insert(AcceptedTransportOrder, ato)

    const shift = new ShiftBuilder()
      .withAllocationUuid(allocation.uuid)
      .withDriverUuid(driver.uuid)
      .build()
    await setup.entityManager.insert(Shift, shift)

    const sequence = new PlanningSequenceBuilder()
      .withShiftUuid(shift.uuid)
      .build()
    await setup.entityManager.insert(PlanningSequence, sequence)

    const job = new ReplanShiftJob(shift.uuid)
    const promise = handler.run(job.data)

    await expect(promise).resolves.not.toThrow()
  })

  it('replans a shift with other assigned atos', async () => {
    const driver = await new DriverSeeder(setup.entityManager).seed()
    const allocationRule = await new AllocationRuleSeeder(setup.entityManager)
      .withDriver(driver)
      .seed()
    const allocation = new AllocationBuilder()
      .withAllocationRuleUuid(allocationRule.uuid)
      .withDriverUuid(driver.uuid)
      .withRange(new DateTimeRange('2025-01-01 10:00:00', '2025-01-01 18:00:00'))
      .withStartAddress(new AddressBuilder().withCoordinates(new Coordinates(0, 0)).build())
      .withEndAddress(new AddressBuilder().withCoordinates(new Coordinates(0, 0)).build())
      .build()
    await setup.entityManager.insert(Allocation, allocation)

    const careUser = await new CareUserSeeder(setup.entityManager).seed()
    const booking = await new BookingSeeder(setup.entityManager).seed()

    const ato = new AcceptedTransportOrderBuilder()
      .withCareUserUuid(careUser.uuid)
      .withBookingUuid(booking.uuid)
      .withClientId(booking.clientId)
      .withContractUuid(booking.contractUuid)
      .withTargetTime(new Date('2025-01-01 12:00:00'))
      .withCancelReason(AtoCanceledReason.CANCELED_BY_CLIENT)
      .withPickupAddress(new AddressBuilder().withCoordinates(new Coordinates(0, 0)).build())
      .withDropOffAddress(new AddressBuilder().withCoordinates(new Coordinates(0, 0)).build())
      .build()
    await setup.entityManager.insert(AcceptedTransportOrder, ato)

    const shift = new ShiftBuilder()
      .withAllocationUuid(allocation.uuid)
      .withDriverUuid(driver.uuid)
      .build()
    await setup.entityManager.insert(Shift, shift)

    const sequence = new PlanningSequenceBuilder()
      .withShiftUuid(shift.uuid)
      .build()
    await setup.entityManager.insert(PlanningSequence, sequence)

    const otherAto = new AcceptedTransportOrderBuilder()
      .withCareUserUuid(careUser.uuid)
      .withBookingUuid(booking.uuid)
      .withClientId(booking.clientId)
      .withContractUuid(booking.contractUuid)
      .withTargetTime(new Date('2025-01-01 12:00:00'))
      .withCancelReason(null)
      .withPickupAddress(new AddressBuilder().withCoordinates(new Coordinates(0, 0)).build())
      .withDropOffAddress(new AddressBuilder().withCoordinates(new Coordinates(0, 0)).build())
      .build()

    await setup.entityManager.insert(AcceptedTransportOrder, otherAto)

    const otherSequence = new PlanningSequenceBuilder()
      .withShiftUuid(shift.uuid)
      .build()
    await setup.entityManager.insert(PlanningSequence, otherSequence)

    const otherPto = new PlannedTransportOrderBuilder()
      .withAcceptedTransportOrderUuid(otherAto.uuid)
      .withCareUserUuid(otherAto.careUserUuid)
      .withClientId(otherAto.clientId)
      .withContractUuid(otherAto.contractUuid)
      .withShiftUuid(shift.uuid)
      .withPlanningSequenceUuid(otherSequence.uuid)
      .build()
    await setup.entityManager.insert(PlannedTransportOrder, otherPto)

    const otherTask = new PlanningTaskBuilder()
      .withPtoUuid(otherPto.uuid)
      .withSequenceUuid(otherSequence.uuid)
      .withShiftUuid(shift.uuid)
      .build()
    await setup.entityManager.insert(PlanningTask, otherTask)

    const job = new ReplanShiftJob(shift.uuid)
    const promise = handler.run(job.data)

    await expect(promise).resolves.not.toThrow()
  })
})
```