/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INCIDENT_ENGINE_URL?: string;
  readonly VITE_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
