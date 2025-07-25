import * as vscode from 'vscode';
import axios, { type AxiosInstance } from 'axios';
import { getStore } from '../../store/store';
import type { SpotifyTrack, Track } from './spotify.types';
import { LyricsService } from './lyrics.service';

export class SpotifyService {
  private static instance: SpotifyService;
  private _context: vscode.ExtensionContext;
  private _httpClient: AxiosInstance;
  private _lyricsService: LyricsService;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._lyricsService = LyricsService.getInstance(context);
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
  public async getCurrentTrack(): Promise<Track> {
    return (async () => {
      const data = await this.makeAuthenticatedRequest<SpotifyTrack>(
        '/me/player/currently-playing'
      );

      const lyrics = await this._lyricsService.fetchSyncedLyrics({
        trackName: data.item.name,
        artistName: data.item.artists[0].name,
        albumName: data.item.album.name,
        durationMs: data.item.duration_ms
      });

      return {
        trackName: data.item.name,
        artistName: data.item.artists[0].name,
        albumName: data.item.album.name,
        durationMs: data.item.duration_ms,
        lyrics: lyrics,
        progressMs: data.progress_ms
      };
    })().catch((error) => {
      throw new Error(`Failed to get current track: ${error.message}`);
    });
  }
}
