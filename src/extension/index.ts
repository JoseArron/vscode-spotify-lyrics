import * as vscode from 'vscode';
import { registerLyricsWebview } from './lyrics.provider';
import { COMMANDS } from '../constants';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  registerLyricsWebview(context);
}

export function deactivate() {}
