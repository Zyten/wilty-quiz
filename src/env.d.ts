/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GSHEET_ID: string
  readonly VITE_GSHEET_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
