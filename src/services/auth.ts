import * as vscode from 'vscode';
import { showErrorMessage, showInformationMessage } from '../info/log';
import { CodeService } from './code';
import type { CommandState } from '../extension/commands';
import { getStore } from '../store/store';

export class AuthService {
  private static instance: AuthService;
  private codeService: CodeService;
  private _context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this.codeService = CodeService.getInstance(context);
  }

  // for singleton instance
  public static getInstance(context: vscode.ExtensionContext): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(context);
    }
    return AuthService.instance;
  }

  public isAuthenticated(): boolean {
    const token = getStore(this._context).getSecret('ACCESS_TOKEN');
    return !!token;
  }

  public async login(): Promise<CommandState> {
    return (async () => {
      showInformationMessage('Logging in to Spotify...');
      const authUrl = await this.codeService.getAuthorizationUrl();
      const uri = vscode.Uri.parse(authUrl);

      showInformationMessage('Opening Spotify login page...');
      await vscode.env.openExternal(uri);

      this.setupAuthCallback();
      return { success: true };
    })().catch((error) => {
      showErrorMessage(`Login failed: ${error}`);
      return { success: false };
    });
  }

  private setupAuthCallback() {
    // disposable uri handler to listen for auth callback
    const disposable = vscode.window.registerUriHandler({
      handleUri: async (uri: vscode.Uri) => {
        const code = uri.query.split('code=')[1]?.split('&')[0];
        showInformationMessage(`Received code: ${code}`);
        if (code) {
          await this.codeService.exchangeCodeForToken(code);
          showInformationMessage('Successfully logged in to Spotify!');
        }
        disposable.dispose();
      }
    });

    // if the callback is not received within 5 minutes, dispose handler
    setTimeout(() => disposable.dispose(), 5 * 60 * 1000);
  }
}
