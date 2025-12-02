/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API: string
  readonly VITE_REACT_APP_VERSION: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
