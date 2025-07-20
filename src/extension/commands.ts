import { commands, ExtensionContext } from 'vscode';
import { COMMANDS } from '../constants';
import { showInformationMessage } from '../info/log';

interface Command {
  command: (typeof COMMANDS)[keyof typeof COMMANDS];
  handler: () => void;
}

export const registerCommands = (context: ExtensionContext) => {
  const commmands: Command[] = [
    {
      command: COMMANDS.TEST,
      handler: () => showInformationMessage('this is a test')
    },
    {
      command: COMMANDS.LOGIN,
      handler: () => showInformationMessage('Logging in to Spotify...')
    }
  ];

  commmands.forEach(({ command, handler }) => {
    const disposable = commands.registerCommand(command, handler);
    context.subscriptions.push(disposable);
  });
};
