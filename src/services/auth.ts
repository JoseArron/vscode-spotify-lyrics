import * as vscode from 'vscode';

export class AuthService {
  private static instance: AuthService;
  private _context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  // for singleton instance
  public static getInstance(context: vscode.ExtensionContext): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(context);
    }
    return AuthService.instance;
  }

  public isAuthenticated(): boolean {
    console.log('Not authenticated yet');
    return false;
  }
}
