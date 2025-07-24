import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { getStore } from '../../store/store';

// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
// helper class to handle spotify auth flow with pkce

export class CodeService {
  private static instance: CodeService;
  private _context: vscode.ExtensionContext;

  private readonly clientId: string = '6473c5d6efdb48c297a51352589eb992';
  private readonly redirectUri: string =
    'vscode://josearron.spotify-lyrics/auth-callback';
  private readonly scopes: string =
    'user-read-currently-playing user-read-playback-state user-modify-playback-state';

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  public static getInstance(context: vscode.ExtensionContext): CodeService {
    if (!CodeService.instance) {
      CodeService.instance = new CodeService(context);
    }
    return CodeService.instance;
  }

  public async getAuthorizationUrl(): Promise<string> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    await getStore(this._context).storeSecret('CODE_VERIFIER', codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: crypto.randomBytes(16).toString('hex')
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  public async exchangeCodeForToken(code: string): Promise<void> {
    const secrets = getStore(this._context);

    const codeVerifier = await secrets.getSecret('CODE_VERIFIER');

    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();

    // store access and refresh tokens
    await secrets.storeSecret('ACCESS_TOKEN', tokenData.access_token);
    await secrets.storeSecret('REFRESH_TOKEN', tokenData.refresh_token);

    // store expiry time
    const expiryTime = Date.now() + tokenData.expires_in * 1000;
    await secrets.storeSecret('TOKEN_EXPIRY', expiryTime.toString());

    await secrets.deleteSecret('CODE_VERIFIER');
  }

  public async refreshToken(): Promise<void> {
    const secrets = getStore(this._context);
    const refreshToken = await secrets.getSecret('REFRESH_TOKEN');

    if (!refreshToken) {
      throw new Error('No refresh token found. Please log in again.');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    await secrets.storeSecret('ACCESS_TOKEN', tokenData.access_token);
    const expiryTime = Date.now() + tokenData.expires_in * 1000;
    await secrets.storeSecret('TOKEN_EXPIRY', expiryTime.toString());
  }

  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return hash.toString('base64url');
  }
}
