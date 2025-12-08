/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAST_UPDATED_DATE?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
