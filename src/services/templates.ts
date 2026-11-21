import { TFile, normalizePath, Notice, TFolder } from 'obsidian';
import { detectKind } from '../infobox/fields/registry';
import AntraPlugin from '../main';
import { ImageSuggestModal } from '../modals/ImageSuggestModal';
import { NoteSuggestModal } from '../modals/NoteSuggestModal';
import { type Service } from '../types';
import { InfoboxView, VIEW_TYPE } from '../infobox/InfoBoxView';
import { getCachedFrontmatter, updateFrontmatter } from './frontmatter';

const LINK_KEY: string = 'antra-template';
const IMAGE_KEY = 'antra-image';
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'];

type Frontmatter = Record<string, unknown>;

export type InfoboxData = NonNullable<
	ReturnType<TemplateService['getInfoboxData']>
>;

export class TemplateService implements Service {
	private schemaKeys = new Map<string, string[]>();

	constructor(
		public plugin: AntraPlugin,
		public getFolder: () => string,
	) {}

	onLoad() {
		this.plugin.registerView(
			VIEW_TYPE,
			(leaf) => new InfoboxView(leaf, this),
		);
		this.plugin.app.workspace.onLayoutReady(() => this.snapshotSchemas());

		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on('changed', (file) => {
				if (this.isTemplate(file))
					void this.handleTemplateChanged(file);
			}),
		);
	}

	onUnload() {}

    private getKind(key: string, templateValue: unknown): string {
        const mtm = (this.plugin.app as unknown as {
            metadataTypeManager?: { getAssignedWidget?: (k: string) => string | null | undefined };
        }).metadataTypeManager;
        return detectKind({ widget: mtm?.getAssignedWidget?.(key), templateValue });
    }

	private getImageUrl(
		resource: TFile,
		fm: Record<string, unknown>,
	): string | null {
		const link = fm[IMAGE_KEY];
		if (typeof link !== 'string') return null;
		const target = /\[\[([^\]|#]+)/.exec(link)?.[1];
		if (!target) return null;
		const file = this.plugin.app.metadataCache.getFirstLinkpathDest(
			target,
			resource.path,
		);
		return file ? this.plugin.app.vault.getResourcePath(file) : null;
	}

	async setImage(path: string, image: TFile | null) {
		const file = this.plugin.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) return;
		await updateFrontmatter(this.plugin.app, file, (fm) => {
			if (image) fm[IMAGE_KEY] = `[[${image.path}]]`;
			else delete fm[IMAGE_KEY];
		});
	}

	openImagePicker(path: string) {
		new ImageSuggestModal(
			this.plugin.app,
			this.getImages(),
			(img) => void this.setImage(path, img),
		).open();
	}

	getImages(): TFile[] {
		return this.plugin.app.vault
			.getFiles()
			.filter((f) => IMAGE_EXT.includes(f.extension.toLowerCase()))
			.sort((a, b) => a.path.localeCompare(b.path));
	}

	snapshotSchemas() {
		this.schemaKeys.clear();
		for (const t of this.getTemplates()) {
			this.schemaKeys.set(t.path, Object.keys(this.getSchema(t)));
		}
	}

	getSchema(template: TFile, previousFiles: TFile[] = []): Frontmatter {
		const fm: Frontmatter = {
			...(this.plugin.app.metadataCache.getFileCache(template)
				?.frontmatter ?? {}),
		};
		
		let subTemplate = this.getTemplateOf(template);
		if (subTemplate) {
			if (previousFiles.includes(subTemplate)) {
				new Notice(
					`Circular template reference detected: ${subTemplate.path} is already in the chain.`,
				);
			} else {
				const subSchema = this.getSchema(subTemplate, [...previousFiles, template]);
				for (const [key, value] of Object.entries(subSchema)) {
					if (!(key in fm)) {
						fm[key] = value;
					}
				}
			}
		}

		delete fm['position'];
		delete fm[LINK_KEY];
		return fm;
	}

	getTemplates(): TFile[] {
		const folder = this.getFolder().trim();
		if (!folder) return [];
		const prefix = normalizePath(folder) + '/';
		return this.plugin.app.vault
			.getMarkdownFiles()
			.filter((f) => f.path.startsWith(prefix))
			.sort((a, b) => a.basename.localeCompare(b.basename));
	}

	getTemplateOf(resource: TFile): TFile | null {
		const fm = getCachedFrontmatter(this.plugin.app, resource);
		if (!fm) return null;
		const link: string = fm?.[LINK_KEY] as string;
		if (typeof link !== 'string') return null;
		const m = link.match(/\[\[([^\]|#]+)/);
		if (!m) return null;
		const target = m?.[1];
		if (!target) return null;
		return this.plugin.app.metadataCache.getFirstLinkpathDest(
			target,
			resource.path,
		);
	}

	async syncResource(resource: TFile, template: TFile) {
		const schema = this.getSchema(template);
		const schemaKeys = Object.keys(schema);

		const fm = getCachedFrontmatter(this.plugin.app, resource);
		const currentKeys = Object.keys(fm).filter(
			(k) => k !== 'position' && k !== LINK_KEY,
		);

		const same =
			currentKeys.length === schemaKeys.length &&
			currentKeys.every((k, i) => k === schemaKeys[i]);
		if (same) return;

		await updateFrontmatter(this.plugin.app, resource, (fm) => {
			const current = { ...fm };
			for (const key of Object.keys(fm)) delete fm[key];

			fm[LINK_KEY] = current[LINK_KEY];
			for (const [key, defaultValue] of Object.entries(schema)) {
				fm[key] = key in current ? current[key] : defaultValue;
			}
		});
	}

	async handleTemplateChanged(template: TFile) {
		const next = Object.keys(this.getSchema(template));
		const prev = this.schemaKeys.get(template.path);
		this.schemaKeys.set(template.path, next);
		if (!prev || prev.length !== next.length) return;

		const renames: [string, string][] = [];
		for (let i = 0; i < prev.length; i++) {
			const a = prev[i],
				b = next[i];
			if (
				a !== undefined &&
				b !== undefined &&
				a !== b &&
				!next.includes(a) &&
				!prev.includes(b)
			) {
				renames.push([a, b]);
			}
		}
		if (renames.length === 0) return;

		for (const resource of this.getResourcesOf(template)) {
			await updateFrontmatter(this.plugin.app, resource, (fm) => {
					for (const [from, to] of renames) {
						if (!(from in fm) || to in fm) continue;
						const entries = Object.entries(fm).map(
							([k, v]) => [k === from ? to : k, v] as const,
						);
						for (const k of Object.keys(fm)) delete fm[k];
						for (const [k, v] of entries) fm[k] = v;
					}
				});
		}
	}

	getResourcesOf(template: TFile): TFile[] {
		return this.plugin.app.vault.getMarkdownFiles().filter((f) => {
			const fm = getCachedFrontmatter(this.plugin.app, f);
			return fm?.['antra-template'] === `[[${template.basename}]]`;
		});
	}

    getInfoboxData(resource: TFile) {
		// If the resource is a template, we don't want to show an infobox for it.
		if (this.isTemplate(resource)) return null;

		// If the resource doesn't have a template, we don't want to show an infobox for it.
        const template = this.getTemplateOf(resource);
        if (!template) return null;

        const schema = this.getSchema(template);
        const fm = getCachedFrontmatter(this.plugin.app, resource);

        const rows = Object.keys(schema).map(key => {
			const label = key.replace(/\s*\([^()]*\)\s*$/, '').trim();
			return {
				key,
				label: this.plugin.settings.capitalizePropertyNames
					? label.charAt(0).toLocaleUpperCase() + label.slice(1)
					: label,
				kind: this.getKind(key, schema[key]),
				value: fm[key] ?? schema[key] ?? null,
			};
		});

        return {
			title: resource.basename,
			path: resource.path,
			image: this.getImageUrl(resource, fm),
			rows,
		};
    }

	isTemplate(file: TFile): boolean {
		return this.getTemplates().includes(file);
	}

	private applyVariables(text: string, title: string): string {
		const now = window.moment();
		return text
			.replace(/{{\s*title\s*}}/g, title)
			.replace(/{{\s*date\s*}}/g, now.format('YYYY-MM-DD'))
			.replace(/{{\s*time\s*}}/g, now.format('HH:mm'));
	}

	async createResource(template: TFile, name: string, targetFolder: string) {
		const raw = await this.read(template);
		const content = this.applyVariables(raw, name);

		const path = normalizePath(`${targetFolder}/${name}.md`);
		const file = await this.plugin.app.vault.create(path, content);

		await updateFrontmatter(this.plugin.app, file, (fm) => {
			fm[LINK_KEY] = `[[${template.basename}]]`;
		});

		await this.plugin.app.workspace.getLeaf(false).openFile(file);
	}

    async setProperty(path: string, key: string, value: unknown) {
        const file = this.plugin.app.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile)) return;
        await updateFrontmatter(this.plugin.app, file, (fm) => {
            fm[key] = value;
        });
    }

	async createNote(name: string, template: TFile | null, folder?: TFolder) {
		const activePath =
			this.plugin.app.workspace.getActiveFile()?.path ?? '';
		const parent =
			folder ?? this.plugin.app.fileManager.getNewFileParent(activePath);
		const path = normalizePath(`${parent.path}/${name}.md`);

		if (this.plugin.app.vault.getAbstractFileByPath(path)) {
			new Notice(`« ${name} » existe déjà.`);
			return;
		}

		const content = template
			? this.applyVariables(await this.read(template), name)
			: '';
		const file = await this.plugin.app.vault.create(path, content);

		if (template) {
			await updateFrontmatter(this.plugin.app, file, (fm) => {
				fm[LINK_KEY] = `[[${template.basename}]]`;
			});
		}

		await this.plugin.app.workspace.getLeaf(false).openFile(file);
	}

    pickNote(sourcePath: string, onChoose: (link: string) => void) {
        new NoteSuggestModal(this.plugin.app, this.plugin.app.vault.getMarkdownFiles(), f => {
            const linktext = this.plugin.app.metadataCache.fileToLinktext(f, sourcePath, true);
            onChoose(`[[${linktext}]]`);
        }).open();
    }
    
    openLink(target: string, sourcePath: string) {
        void this.plugin.app.workspace.openLinkText(target, sourcePath);
    }

	async read(template: TFile): Promise<string> {
		return this.plugin.app.vault.cachedRead(template);
	}
}
