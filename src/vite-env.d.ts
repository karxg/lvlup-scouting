/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SUBMIT_WEBHOOK_URL?: string
  readonly CF_ANALYTICS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
