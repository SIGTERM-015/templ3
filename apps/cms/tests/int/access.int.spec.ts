import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let adminId: string | number

const ADMIN = {
  email: 'access-test-admin@example.com',
  password: 'correct-horse-battery-staple',
  role: 'admin' as const,
  enableAPIKey: true,
  apiKey: 'access-test-secret-api-key',
}

describe('Access control (anonymous visitor)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await payload.delete({ collection: 'users', where: { email: { equals: ADMIN.email } } })
    const admin = await payload.create({ collection: 'users', data: ADMIN })
    adminId = admin.id
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', id: adminId })
  })

  it('cannot list users', async () => {
    const result = await payload
      .find({ collection: 'users', overrideAccess: false })
      .then((r) => r.docs, (e: Error) => e.name)
    expect(result).toBe('Forbidden')
  })

  it('cannot read a user by id', async () => {
    const result = await payload
      .findByID({ collection: 'users', id: adminId, overrideAccess: false })
      .then((doc) => doc, (e: Error) => e.name)
    expect(result).toBe('Forbidden')
  })
})

describe('Access control (non-admin user)', () => {
  let editorId: string | number

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const editor = await payload.create({
      collection: 'users',
      data: {
        email: 'access-test-editor@example.com',
        password: 'another-long-password',
        role: 'editor',
      },
    })
    editorId = editor.id
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', id: editorId })
  })

  it('sees only their own user record', async () => {
    const editor = await payload.findByID({ collection: 'users', id: editorId })
    const { docs } = await payload.find({ collection: 'users', overrideAccess: false, user: editor })
    expect(docs.map((d) => d.email)).toEqual(['access-test-editor@example.com'])
  })
})
