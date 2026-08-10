# meme-generator-mcp

List popular meme templates and build caption URLs with the free Imgflip API. Image rendering happens on the Imgflip side.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `templates`  List popular meme templates.
* `caption`  Build a caption URL for a template.

## Usage

```bash
npm install
npm run build
node dist/index.js
```
