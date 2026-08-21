# simple-snapshot-audit

Warn when snapshot files change without a paired test file change.

## Usage

```yaml
name: Simple Snapshot Audit
on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  simple-snapshot-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dmytropaduchak/simple-snapshot-audit@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Develop

```bash
npm install && npm run build
```
