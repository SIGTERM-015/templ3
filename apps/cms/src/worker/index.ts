/// <reference types="@cloudflare/workers-types" />

import { Container } from '@cloudflare/containers'

export class PayloadContainer extends Container {
  defaultPort = 3000
  sleepAfter = '10m'

  override onError(error: unknown) {
    console.error('Payload container error', error)
  }
}

type Env = {
  CMS_CONTAINER: DurableObjectNamespace<PayloadContainer>
  DATABASE_URL: string
  NEXT_PUBLIC_SERVER_URL?: string
  PAYLOAD_SECRET: string
  R2_ACCESS_KEY_ID?: string
  R2_BUCKET?: string
  R2_ENDPOINT?: string
  R2_REGION?: string
  R2_SECRET_ACCESS_KEY?: string
}

export default {
  async fetch(request, env) {
    const container = env.CMS_CONTAINER.getByName('templ3-cms')
    const envVars: Record<string, string> = {
      DATABASE_URL: env.DATABASE_URL,
      NEXT_PUBLIC_SERVER_URL: env.NEXT_PUBLIC_SERVER_URL || new URL(request.url).origin,
      PAYLOAD_SECRET: env.PAYLOAD_SECRET,
    }

    if (env.R2_BUCKET && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_ENDPOINT) {
      envVars.R2_BUCKET = env.R2_BUCKET
      envVars.R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID
      envVars.R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY
      envVars.R2_ENDPOINT = env.R2_ENDPOINT
      envVars.R2_REGION = env.R2_REGION || 'auto'
    }

    await container.startAndWaitForPorts({
      ports: 3000,
      startOptions: {
        envVars,
      },
    })

    return container.fetch(request)
  },
} satisfies ExportedHandler<Env>
