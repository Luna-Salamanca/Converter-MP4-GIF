/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAST_UPDATED_DATE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
