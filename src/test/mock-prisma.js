/**
 * Vitest requires PrismaClient mocks to be constructable classes.
 */
export function mockPrismaClient(models) {
  return {
    PrismaClient: class MockPrismaClient {
      constructor() {
        Object.assign(this, models)
      }
    },
  }
}

export function mockResend(sendImpl) {
  return {
    Resend: class MockResend {
      constructor() {
        this.emails = { send: sendImpl }
      }
    },
  }
}
