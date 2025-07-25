export interface GetLyricsParams {
  track_name: string;
  artist_name: string;
  album_name: string;
  duration: number; // in seconds
}

export interface LrcLibTrack {
  id: string;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number; // in seconds
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
}

export interface SyncedLyrics {
  time: number; // ms
  lyric: string;
}
