import * as vscode from 'vscode';
import { getNonce } from '../utils/nonce';
import { AuthService } from '../services/auth';

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
  public static readonly viewType = 'spotify-lyrics.view';

  private _view?: vscode.WebviewView;
  private _authService: AuthService;

  constructor(private readonly _context: vscode.ExtensionContext) {
    this._authService = AuthService.getInstance(_context);
  }

  // init method to set up the webview
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    // initialize webview
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // listen to messages from the webview
    webviewView.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          // if the webview asks to check user auth
          case 'check-auth':
            this.sendAuthStatus();
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );
  }

  // send auth state to webview
  private sendAuthStatus() {
    if (!this._view) {
      return;
    }

    const isAuthenticated = this._authService.isAuthenticated();

    this._view.webview.postMessage({
      type: 'auth-status',
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
