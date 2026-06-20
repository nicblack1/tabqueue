# tabqueue

A CLI tool to manage and batch-open curated URL lists from the terminal with tagging support.

## Installation

```bash
npm install -g tabqueue
```

## Usage

```bash
# Add a URL with tags
tabqueue add https://example.com --tags work,research

# List all saved URLs
tabqueue list

# Open all URLs matching a tag
tabqueue open --tag work

# Open all URLs in the queue
tabqueue open --all

# Remove a URL
tabqueue remove https://example.com
```

Saved URLs are stored locally in `~/.tabqueue/queue.json`, making your lists persistent across sessions.

## Commands

| Command | Description |
|---|---|
| `add <url>` | Add a URL to the queue |
| `list` | Display all saved URLs and tags |
| `open` | Batch-open URLs in your default browser |
| `remove <url>` | Remove a URL from the queue |
| `clear` | Clear the entire queue |

## Options

- `--tag, -t` — Filter by tag
- `--all, -a` — Target all saved URLs
- `--tags` — Comma-separated tags when adding a URL

## License

MIT © [Your Name](https://github.com/yourusername)