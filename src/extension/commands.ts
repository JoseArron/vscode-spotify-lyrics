import { commands, type ExtensionContext } from 'vscode';
import { COMMANDS } from '../constants';
import { AuthService } from '../domains/auth/auth.service';

interface Command {
  command: (typeof COMMANDS)[keyof typeof COMMANDS];
  handler: () => void | Promise<void>;
}

export const registerCommands = (context: ExtensionContext) => {
  const authService = AuthService.getInstance(context);

  const commmands: Command[] = [
    {
      command: COMMANDS.LOGIN,
      handler: () => authService.login()
    }
  ];

  commmands.forEach(({ command, handler }) => {
    const disposable = commands.registerCommand(command, handler);
    context.subscriptions.push(disposable);
  });
};
