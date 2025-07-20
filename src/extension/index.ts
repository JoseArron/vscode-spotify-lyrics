import * as vscode from "vscode";

import { registerLyricsWebview } from "./lyrics.webview";

const test = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand("spotify-lyrics.test", () => {
      vscode.window.showInformationMessage("this is spotify lyrics test");
    })
  );
};

export function activate(context: vscode.ExtensionContext) {
  test(context);

  registerLyricsWebview(context);
}

export function deactivate() {}
