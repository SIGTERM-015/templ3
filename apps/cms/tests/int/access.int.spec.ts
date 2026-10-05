import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'

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
    await payload.delete({ collection: 'users', where: { email: { equals: 'access-test-editor@example.com' } } })
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

describe("Access control (the site's api key)", () => {
  let apiUser: User

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await payload.delete({ collection: 'users', where: { email: { equals: 'access-test-api@example.com' } } })
    apiUser = await payload.create({
      collection: 'users',
      data: { email: 'access-test-api@example.com', password: 'api-user-password', role: 'api' },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', id: apiUser.id })
  })

  const asApi = () => ({ overrideAccess: false, user: { ...apiUser, collection: 'users' as const } })

  it('cannot create content', async () => {
    const result = await payload
      .create({
        collection: 'notes',
        data: { title: 'pwned', slug: 'pwned', content: '<img src=x onerror=alert(1)>' },
        draft: true,
        ...asApi(),
      })
      .then(() => 'created', (e: Error) => e.name)
    expect(result).toBe('Forbidden')
  })

  it('cannot update the site identity global', async () => {
    const result = await payload
      .updateGlobal({ slug: 'site-identity', data: {}, ...asApi() })
      .then(() => 'updated', (e: Error) => e.name)
    expect(result).toBe('Forbidden')
  })

  it('can still read content', async () => {
    const { docs } = await payload.find({ collection: 'tags', ...asApi() })
    expect(docs).toEqual([])
  })
})

describe('URL fields', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('reject javascript: URLs', async () => {
    const result = await payload
      .create({
        collection: 'links',
        data: { label: 'x', platform: 'x', href: 'javascript:alert(document.cookie)', description: 'x' },
      })
      .then(() => 'created', (e: Error) => e.name)
    expect(result).toBe('ValidationError')
  })

  it('accept mailto: links', async () => {
    const link = await payload.create({
      collection: 'links',
      data: { label: 'Email', platform: 'Direct line', href: 'mailto:me@example.com', description: 'x' },
    })
    expect(link.href).toBe('mailto:me@example.com')
    await payload.delete({ collection: 'links', id: link.id })
  })
})
