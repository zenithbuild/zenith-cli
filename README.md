# @zenith/cli

Command-line interface for the Zenith framework.

## Installation

```bash
bun add @zenith/cli
```

## Commands

### Development

```bash
# Start dev server
zenith dev [--port 3000]

# Build for production
zenith build [--outDir dist]

# Preview production build
zenith preview [--port 4000]
```

### Plugin Management

```bash
# Add a plugin
zenith add tailwind

# Remove a plugin
zenith remove tailwind
```

Plugins are tracked in `zenith.plugins.json`.

## Coming Soon

- `zenith test` – Run tests
- `zenith export` – Export static build
- `zenith deploy` – Deploy to hosting

## Project Detection

The CLI automatically detects your Zenith project by finding `package.json` with `@zenith/*` dependencies.

## License

MIT
