import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { showErrorMessage, showInformationMessage } from '../../info/log';
import { CodeService } from './code.service';
import { getStore } from '../../store/store';
import { EVENTS } from '../../constants';

interface AuthEvents {
  authStatusChanged: () => void;
}

export class AuthService extends EventEmitter {
  public on<U extends keyof AuthEvents>(
    event: U,
    listener: AuthEvents[U]
  ): this {
    return super.on(event, listener);
  }

  public emit<U extends keyof AuthEvents>(
    event: U,
    ...args: Parameters<AuthEvents[U]>
  ): boolean {
    return super.emit(event, ...args);
  }

  private static instance: AuthService;
  private _codeService: CodeService;
  private _context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    super();
    this._context = context;
    this._codeService = CodeService.getInstance(context);
  }

  // for singleton instance
  public static getInstance(context: vscode.ExtensionContext): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(context);
    }
    return AuthService.instance;
  }

  public async isAuthenticated(): Promise<boolean> {
    const secrets = getStore(this._context);

    const token = await secrets.getSecret('ACCESS_TOKEN');
    const refreshToken = await secrets.getSecret('REFRESH_TOKEN');
    const expiry = await secrets.getSecret('TOKEN_EXPIRY');

    if (!token || !refreshToken) {
      showInformationMessage('Not authenticated, please login to Spotify.');
      return false;
    }

    // refresh token if expired
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      return (async () => {
        showInformationMessage('Token expired, refreshing...');
        await this._codeService.refreshToken();
        return true;
        // on error
      })().catch(async (error) => {
        showErrorMessage(`Token refresh failed: ${error}`);
        await this.logout();
        return false;
      });
    }

    return true;
  }

  public async logout(): Promise<void> {
    return (async () => {
      showInformationMessage('Logging out from Spotify...');

      // delete tokens
      await getStore(this._context).deleteSecret('ACCESS_TOKEN');
      await getStore(this._context).deleteSecret('REFRESH_TOKEN');
      await getStore(this._context).deleteSecret('TOKEN_EXPIRY');
      await getStore(this._context).deleteSecret('CODE_VERIFIER');

      // emit auth status changed event
      this.emit(EVENTS.AUTH_STATUS_CHANGED);

      showInformationMessage('Successfully logged out from Spotify!');
    })().catch((error) => {
      showErrorMessage(`Logout failed: ${error}`);
    });
  }

  public async login(): Promise<void> {
    return (async () => {
      showInformationMessage('Logging in to Spotify...');

      // open spotify oauth URL
      const authUrl = await this._codeService.getAuthorizationUrl();
      const uri = vscode.Uri.parse(authUrl);
      showInformationMessage('Opening Spotify login page...');
      await vscode.env.openExternal(uri);

      this.setupAuthCallback();
    })().catch((error) => {
      showErrorMessage(`Login failed: ${error}`);
    });
  }

  private setupAuthCallback() {
    // disposable uri handler to listen for auth callback
    const disposable = vscode.window.registerUriHandler({
      handleUri: async (uri: vscode.Uri) => {
        // extract the code
        const code = uri.query.split('code=')[1]?.split('&')[0];
        showInformationMessage(`Received code: ${code}`);
        if (code) {
          // use the code to get access token
          await this._codeService.exchangeCodeForToken(code);

          // emit auth status changed event
          this.emit(EVENTS.AUTH_STATUS_CHANGED);
        }
        disposable.dispose();
      }
    });

    // if the callback is not received within 5 minutes, dispose handler
    setTimeout(() => disposable.dispose(), 5 * 60 * 1000);
  }
}
