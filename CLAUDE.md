# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development & Preview
- `pnpm dev` - Start development server with live preview for slides in src/ directory
- `pnpm dev:tmp` - Start development server for template slides
- `pnpm new <slidename>` - Create new slide from template (can include paths like `path/to/slidename`)

### Build & Deploy
- `pnpm build` - Build slides to dist/ directory (creates both HTML and PNG images)
- `pnpm start` - Serve built slides from dist/ directory
- `pnpm check` - Validate OGP image URLs match file structure

### Setup
- `scripts/init` - Initialize repository settings (GitHub user ID, repo name)

## Architecture

This is a Marp presentation framework with custom extensions:

### Core Structure
- **src/** - Slide source files (deployed content)
- **template/** - Template files for new slides
- **themes/** - Custom CSS themes and utilities
- **engine.mjs** - Marp CLI engine with markdown-it plugins
- **.marprc.yml** - Marp CLI configuration

### Engine Extensions
The engine.mjs file extends Marp with these markdown-it plugins:
- `markdown-it-container` - Block containers with `:::c` (columns) and `:::_` (grouping)
- `markdown-it-attrs` - CSS class assignment with `{.class}` syntax
- `markdown-it-mark` - Highlighting with `==text=={.class}`
- `markdown-it-ins` - Insertions/underlines
- `markdown-it-prism` - Syntax highlighting
- `markdown-it-textual-uml` - UML diagram support

### Theme System
- **themes/index.css** - Main theme entry point
- **themes/global.css** - Global slide customizations
- **themes/utility.css** - Utility classes (inspired by Tailwind CSS)

### Special Features
- Auto-deployment to GitHub Pages via GitHub Actions
- OGP image generation and validation
- Column layouts with `:::c` containers
- Filename display in code blocks with `{name=filename}`
- Alert designs with utility classes (`.note`, `.important`, `.tip`, `.warning`, `.caution`)

### File Organization
- Each slide directory should contain `index.md` as the main slide file
- OGP images are automatically generated as `index.png`
- Images should be placed in corresponding `images/` subdirectories

## Development Notes
- Uses pnpm as package manager
- Requires Node.js 20.18.0+
- VSCode Marp extension features are limited due to custom engine
- Language setting: Japanese (configured in .marprc.yml)
- Theme: Custom based on Marp's gaia theme