import { window } from 'vscode';

export const showInformationMessage = (message: string) => {
  return window.showInformationMessage(`vscode-spotify-lyrics - ${message}`);
};

export const showWarningMessage = (message: string, ...items: string[]) => {
  return window.showWarningMessage(
    `vscode-spotify-lyrics - ${message}`,
    ...items
  );
};

export const showErrorMessage = (message: string) => {
  return window.showErrorMessage(`vscode-spotify-lyrics - ${message}`);
};
