/// <reference types="@cloudflare/workers-types" />

import { Container } from '@cloudflare/containers'

export class PayloadContainer extends Container {
  defaultPort = 3000
  sleepAfter = '10m'

  override onError(error: unknown) {
    console.error('Payload container error', error)
  }
}

type SecretBinding = { get(): Promise<string> }

type Env = {
  CMS_CONTAINER: DurableObjectNamespace<PayloadContainer>
  DATABASE_URL?: SecretBinding
  NEXT_PUBLIC_SERVER_URL?: string
  PAYLOAD_SECRET?: SecretBinding
  SITE_URL?: string
  R2_ACCESS_KEY_ID?: SecretBinding
  R2_BUCKET?: SecretBinding
  R2_ENDPOINT?: string
  R2_REGION?: string
  R2_SECRET_ACCESS_KEY?: SecretBinding
  SMTP_PASS?: SecretBinding
  SMTP_USER?: SecretBinding
}

async function resolveSecret(binding: SecretBinding | undefined): Promise<string | undefined> {
  if (!binding) return undefined
  return binding.get()
}

export default {
  async fetch(request, env) {
    const id = env.CMS_CONTAINER.idFromName('templ3-cms')
    const container = env.CMS_CONTAINER.get(id, { locationHint: 'weur' })

    const [databaseUrl, payloadSecret, r2AccessKeyId, r2Bucket, r2SecretAccessKey, smtpUser, smtpPass] =
      await Promise.all([
        resolveSecret(env.DATABASE_URL),
        resolveSecret(env.PAYLOAD_SECRET),
        resolveSecret(env.R2_ACCESS_KEY_ID),
        resolveSecret(env.R2_BUCKET),
        resolveSecret(env.R2_SECRET_ACCESS_KEY),
        resolveSecret(env.SMTP_USER),
        resolveSecret(env.SMTP_PASS),
      ])

    if (!databaseUrl || !payloadSecret) {
      return new Response('CMS misconfigured: DATABASE_URL or PAYLOAD_SECRET missing', {
        status: 503,
      })
    }

    const envVars: Record<string, string> = {
      DATABASE_URL: databaseUrl,
      NEXT_PUBLIC_SERVER_URL: env.NEXT_PUBLIC_SERVER_URL || new URL(request.url).origin,
      PAYLOAD_SECRET: payloadSecret,
      ...(env.SITE_URL && { SITE_URL: env.SITE_URL }),
    }

    if (r2Bucket && r2AccessKeyId && r2SecretAccessKey && env.R2_ENDPOINT) {
      envVars.R2_BUCKET = r2Bucket
      envVars.R2_ACCESS_KEY_ID = r2AccessKeyId
      envVars.R2_SECRET_ACCESS_KEY = r2SecretAccessKey
      envVars.R2_ENDPOINT = env.R2_ENDPOINT
      envVars.R2_REGION = env.R2_REGION || 'auto'
    }

    if (smtpUser) envVars.SMTP_USER = smtpUser
    if (smtpPass) envVars.SMTP_PASS = smtpPass

    await container.startAndWaitForPorts({
      ports: 3000,
      startOptions: {
        envVars,
      },
    })

    return container.fetch(request)
  },
} satisfies ExportedHandler<Env>
