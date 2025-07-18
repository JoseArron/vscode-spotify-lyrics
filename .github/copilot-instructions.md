# Spotify Lyrics VS Code Extension - Copilot Instructions

## Project Overview

This is a VS Code extension that displays synchronized lyrics for currently playing Spotify tracks. The extension integrates with Spotify Web API for track information and LRCLib API for lyrics data, displaying them in a webview sidebar panel.

## Key Architecture Components

### Extension Structure

- **Main entry**: `src/extension.ts` - Extension activation/deactivation lifecycle
- **Command registration**: Commands defined in `package.json` contributes section must match `vscode.commands.registerCommand()` calls
- **Current command mismatch**: `package.json` defines `spotify-lyrics.playLyrics` but code registers `spotify-lyrics.helloWorld`

### Build System & Development Workflow

- **Dual build system**: Both TypeScript (`tsc`) and esbuild are configured
- **Watch tasks**: `npm: watch:tsc` and `npm: watch:esbuild` run concurrently (check with `get_task_output`)
- **Entry point**: `src/extension.ts` → `out/extension.js` (main field in package.json)

### Configuration Patterns

- **TypeScript**: ES2022 target, Node16 modules, strict mode enabled
- **ESLint**: Uses flat config with TypeScript plugin, enforces naming conventions
- **Package.json**: Extension targets VS Code 1.102.0+, categorized as "Other"

## Implementation Guidelines

### VS Code Extension Patterns

```typescript
// Always register commands in activate() and add to context.subscriptions
const disposable = vscode.commands.registerCommand("command-id", handler);
context.subscriptions.push(disposable);
```

### Planned API Integration Architecture

Based on the technical spec, implement these modules:

- **Spotify API Client**: OAuth 2.0 auth, polling strategy (15-second intervals)
- **LRCLib API Client**: Lyrics fetching with fallback handling
- **Webview Panel**: Sidebar integration with Svelte frontend
- **State Management**: Track current song, lyrics sync, auth status

### Polling Strategy (Key Technical Requirement)

- Poll Spotify's `currently-playing` endpoint every 15 seconds
- Compare `track.id` to detect song changes
- Use `progress_ms` for lyrics synchronization
- Pause polling when not playing or VS Code unfocused

### Error Handling Priorities

1. Network failures → Clear webview error messages
2. API unavailability → Graceful degradation
3. Missing lyrics → "No lyrics found" display
4. Auth expiration → Re-authentication flow

## Development Commands

- `npm run watch` - TypeScript compilation in watch mode
- `npm run compile` - One-time TypeScript build
- `npm run lint` - ESLint validation
- `npm test` - Run extension tests
- Use VS Code tasks for background building during development

## Critical Notes

- **Command ID mismatch**: Update either package.json command or extension.ts registration
- **Webview theming**: Must adapt to VS Code themes (light/dark/high-contrast)
- **Rate limiting**: Stay within Spotify's 100 requests/minute limit
- **Extension activation**: Currently on any command execution (activationEvents: [])
