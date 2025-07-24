import * as vscode from 'vscode';
import { getNonce } from '../utils/nonce';
import { AuthService } from '../services/auth';
import {
  BUTTONS,
  COMMANDS,
  EVENTS,
  MESSAGES,
  WEBVIEW_VIEW_ID
} from '../constants';
import { showWarningMessage } from '../info/log';
import { SpotifyService } from '../services/spotify';

export const registerLyricsWebview = (context: vscode.ExtensionContext) => {
  const provider = new LyricsWebviewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      LyricsWebviewProvider.viewType,
      provider
    )
  );
};

class LyricsWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = WEBVIEW_VIEW_ID;

  private _view?: vscode.WebviewView;
  private _authService: AuthService;
  private _spotifyService: SpotifyService;

  constructor(private readonly _context: vscode.ExtensionContext) {
    this._authService = AuthService.getInstance(_context);
    this._spotifyService = SpotifyService.getInstance(_context);
  }

  // init method to set up the webview
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.initWebview(webviewView);
    this.setupListeners(webviewView);
    // check initial auth status
    this.checkAuthentication();
  }

  private initWebview(webview: vscode.WebviewView) {
    this._view = webview;

    webview.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri]
    };

    webview.webview.html = this._getHtmlForWebview(webview.webview);
  }

  private setupListeners(webview: vscode.WebviewView) {
    webview.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          // if the webview asks to check user auth
          case MESSAGES.REQ_AUTH_STATUS:
            await this.sendAuthStatus();
            break;
          // login from webview button
          case MESSAGES.REQ_LOG_IN:
            await vscode.commands.executeCommand(COMMANDS.LOGIN);
            break;
          case MESSAGES.REQ_LOG_OUT:
            await this._authService.logout();
            break;
          case MESSAGES.REQ_TRACK:
            this.checkAuthentication();
            this.sendCurrentTrack();
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );

    // listen to auth status changes
    this._authService.on(EVENTS.AUTH_STATUS_CHANGED, () => {
      this.sendAuthStatus();
    });
  }

  private async sendCurrentTrack() {
    // TODO: poll for current track in an interval
    const track = await this._spotifyService.getCurrentTrack();
    this._view?.webview.postMessage({
      type: MESSAGES.SEND_TRACK,
      track
    });
  }

  private async checkAuthentication() {
    const isAuthenticated = await this._authService.isAuthenticated();

    if (!isAuthenticated) {
      const action = showWarningMessage(
        'You are not authenticated. Please log in to Spotify to view lyrics.',
        BUTTONS.LOG_IN
      );

      action.then((selection) => {
        if (selection === BUTTONS.LOG_IN) {
          vscode.commands.executeCommand(COMMANDS.LOGIN);
        }
      });

      return;
    }
  }

  // send auth state to webview
  public async sendAuthStatus() {
    if (!this._view) {
      return;
    }

    const isAuthenticated = await this._authService.isAuthenticated();

    this._view.webview.postMessage({
      type: MESSAGES.SEND_AUTH_STATUS,
      isAuthenticated
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    const extUri = this._context.extensionUri;
    const resetStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extUri, 'src', 'styles/reset.css')
    );
    const vsCodeStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extUri, 'src', 'styles/vscode.css')
    );
    const globalsStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extUri, 'src', 'styles/globals.css')
    );
    const appStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extUri, 'out', 'compiled/bundle.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extUri, 'out', 'compiled/bundle.js')
    );

    return /*html*/ `<!DOCTYPE html>
			<html lang="en">
			<head>
        <title>Spotify Lyrics</title>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
				-->

				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${resetStyleUri}" rel="stylesheet">
				<link href="${vsCodeStyleUri}" rel="stylesheet">
				<link href="${globalsStyleUri}" rel="stylesheet">
				<link href="${appStyleUri}" rel="stylesheet">
        <script defer nonce="${nonce}" src="${scriptUri}"></script>
				
			</head>
			<body id="app">
			</body>
			</html>`;
  }
}
