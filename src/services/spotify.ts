import * as vscode from 'vscode';

export class SpotifyService {
  private static instance: SpotifyService;
  public readonly clientId: string = '6473c5d6efdb48c297a51352589eb992';
  public readonly redirectUri: string =
    'vscode://josearron.spotify-lyrics/auth-callback';
  public readonly scopes: string =
    'user-read-currently-playing user-read-playback-state user-modify-playback-state';

  private constructor() {}

  public static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService();
    }
    return SpotifyService.instance;
  }
}
