/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_SPREADSHEET_ID?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google Identity Services global (loaded at runtime).
interface TokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
}
interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
  callback: (resp: TokenResponse) => void;
}
interface GoogleAccountsOauth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (resp: TokenResponse) => void;
  }) => TokenClient;
}
interface Window {
  google?: {
    accounts: { oauth2: GoogleAccountsOauth2 };
  };
}
