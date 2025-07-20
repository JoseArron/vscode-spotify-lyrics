import * as vscode from 'vscode';
import axios, { type AxiosInstance } from 'axios';
import { getStore } from '../store/store';

export class SpotifyService {
  private static instance: SpotifyService;
  private _context: vscode.ExtensionContext;
  private _httpClient: AxiosInstance;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._httpClient = axios.create({
      baseURL: 'https://api.spotify.com/v1'
    });
  }

  public static getInstance(context: vscode.ExtensionContext): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService(context);
    }
    return SpotifyService.instance;
  }

  private async getAccessToken(): Promise<string | null> {
    const accessToken = await getStore(this._context).getSecret('ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('User is not authenticated. Please log in to Spotify.');
    }
    return accessToken;
  }

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options?: any
  ): Promise<T> {
    return (async () => {
      const accessToken = await this.getAccessToken();

      const res = await this._httpClient.get<T>(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        ...options
      });
      return res.data;
    })().catch((error) => {
      throw new Error(`Request to Spotify API failed: ${error.message}`);
    });
  }

  // get user's currently playing track
  public async getCurrentTrack(): Promise<any> {
    return (async () => {
      const data = await this.makeAuthenticatedRequest<any>(
        '/me/player/currently-playing'
      );
      return data;
    })().catch((error) => {
      throw new Error(`Failed to get current track: ${error.message}`);
    });
  }
}
