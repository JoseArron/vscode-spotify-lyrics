import type { AxiosInstance } from 'axios';
import axios from 'axios';
import * as vscode from 'vscode';
import type {
  GetLyricsParams,
  LrcLibTrack,
  SyncedLyrics
} from './lyrics.types';
import type { Track } from './spotify.types';

export class LyricsService {
  private static instance: LyricsService;
  private _context: vscode.ExtensionContext;
  private _httpClient: AxiosInstance;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._httpClient = axios.create({
      baseURL: 'https://lrclib.net/api'
    });
  }

  public static getInstance(context: vscode.ExtensionContext): LyricsService {
    if (!LyricsService.instance) {
      LyricsService.instance = new LyricsService(context);
    }
    return LyricsService.instance;
  }

  public async fetchSyncedLyrics(
    track: Omit<Track, 'lyrics' | 'progressMs'>
  ): Promise<SyncedLyrics[]> {
    try {
      const params: GetLyricsParams = {
        track_name: track.trackName,
        artist_name: track.artistName,
        album_name: track.albumName,
        duration: track.durationMs / 1000
      };

      const res = await this._httpClient.get<LrcLibTrack>('/get', { params });

      if (!res.data || !res.data.syncedLyrics) {
        throw new Error('No lyrics found for the specified track.');
      }

      return this.parseSyncedLyrics(res.data.syncedLyrics);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch lyrics: ${errorMessage}`);
    }
  }

  private parseSyncedLyrics(syncedLyricsString: string): SyncedLyrics[] {
    if (!syncedLyricsString || syncedLyricsString.trim() === '') {
      return [];
    }

    const lines = syncedLyricsString
      .split('\n')
      .filter((line) => line.trim() !== '');

    const parsedLyrics: SyncedLyrics[] = [];

    for (const line of lines) {
      const parsed = this.parseLyricLine(line);
      if (parsed) {
        parsedLyrics.push(parsed);
      }
    }

    return parsedLyrics;
  }

  private parseLyricLine(line: string): SyncedLyrics | null {
    // [00:00.00] first line
    const lrcRegex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)$/;
    const match = line.match(lrcRegex);

    if (!match) {
      console.warn(`Failed to parse lyric line: "${line}"`);
      return null;
    }

    const [, minutes, seconds, centiseconds, lyric] = match;

    // convert to ms
    const timeInMs =
      parseInt(minutes) * 60 * 1000 + // minutes to ms
      parseInt(seconds) * 1000 + // seconds to ms
      parseInt(centiseconds.padEnd(3, '0').substring(0, 3)); // centiseconds to ms

    return {
      time: timeInMs,
      lyric: lyric.trim()
    };
  }
}
