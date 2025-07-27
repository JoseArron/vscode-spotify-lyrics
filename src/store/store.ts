import * as vscode from 'vscode';

export const SECRET_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  TOKEN_EXPIRY: 'spotify_token_expiry',
  CODE_VERIFIER: 'spotify_code_verifier'
};

export const getStore = (context: vscode.ExtensionContext) => {
  return {
    getSecret: (key: keyof typeof SECRET_KEYS) => context.secrets.get(key),
    storeSecret: (key: keyof typeof SECRET_KEYS, value: string) =>
      context.secrets.store(key, value),
    deleteSecret: (key: keyof typeof SECRET_KEYS) => context.secrets.delete(key)
  };
};

// TODO: use vscode global store for current track info
