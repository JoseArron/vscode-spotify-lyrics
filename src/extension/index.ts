import * as vscode from 'vscode';
import { registerLyricsWebview } from './lyrics.provider';
import { COMMANDS } from '../constants';

const test = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.TEST, () => {
      vscode.window.showInformationMessage('this is spotify lyrics test');
    })
  );
};

export function activate(context: vscode.ExtensionContext) {
  test(context);

  registerLyricsWebview(context);
}

export function deactivate() {}
