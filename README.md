# Antra

**Antra** is an [Obsidian](https://obsidian.md/) plugin for creating dynamic templates for your notes.

Each template defines a set of properties. When you create a new resource, you can select a template: the note inherits the template's properties and automatically displays a wiki-style infobox.

## Features

- Create resources from templates
- Inherit properties from a template
- Display an infobox in editing and reading modes
- Add a cover image or banner to a resource
- Edit properties directly from the infobox
- Automatically synchronize new properties with existing resources
- Automatically rename properties when they are renamed in templates

## Usage

### 1. Configure the template folder

In Antra's settings, select the folder containing your template notes.

Markdown notes inside this folder or its subfolders are recognized as templates.

### 2. Create a template

Create a note in the configured folder, then define its properties in YAML frontmatter. These frontmatter values initialize the properties of future resources.

```yaml
---
name: Character
species: Human
mentor:
allies: []
active: true
level: 1
birthdate: 2026-11-20
---
```

### 3. Create a resource

Use the **New note** button in the file explorer or open a folder's context menu.

In the creation modal:

1. Enter the new note's name.
2. Enable **Create a resource**.
3. Select the desired template.
4. Click **Create**.

Antra automatically adds an internal reference to the template and copies its content and properties.

### 4. Customize a resource

Resources linked to a template display an infobox above their content. You can edit their properties directly from the infobox while in editing mode.

To add a banner or cover image:

1. Select the infobox options button.
2. Choose an image available in your vault.
3. The `antra-image` property is updated automatically.

## Available variables

When you create a resource from a template, Antra replaces the following variables in the template content:

| Variable | Value |
| --- | --- |
| `{{title}}` | Name of the new resource |
| `{{date}}` | Current date in `YYYY-MM-DD` format |
| `{{time}}` | Current time in `HH:mm` format |

## Development

### Install dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Development mode

```bash
npm run dev
```

### Checks

```bash
npm run lint
npm run svelte-check
```

## License

This project is distributed under the [MIT LICENSE](LICENSE).

