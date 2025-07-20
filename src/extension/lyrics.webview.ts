import * as vscode from "vscode";
import { getNonce } from "../utils/nonce";

export const registerLyricsWebview = (context: vscode.ExtensionContext) => {
  const provider = new SpotifyLyricsWebview(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SpotifyLyricsWebview.viewType,
      provider
    )
  );
};

class SpotifyLyricsWebview implements vscode.WebviewViewProvider {
  public static readonly viewType = "spotify-lyrics.view";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    const resetStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const vsCodeStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const appStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/bundle.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/bundle.js")
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
				<link href="${appStyleUri}" rel="stylesheet">
        <script defer nonce="${nonce}" src="${scriptUri}"></script>
				
			</head>
			<body id="app">
			</body>
			</html>`;
  }
}
