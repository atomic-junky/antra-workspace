import { MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SettingsTab } from './settings';
import { TemplateService } from './services/templates';
import type { AntraSettings } from './types';
import { ModalService } from './modals';
import { infoboxExtension, refreshInfobox } from './infobox/InfoBoxExtension';
import Infobox from './infobox/InfoBox.svelte';
import { mount, unmount } from 'svelte';
import { EditorView } from '@codemirror/view';
import { createInfoboxProps } from './infobox/props';

export default class AntraPlugin extends Plugin {
	public settings: AntraSettings = { ...DEFAULT_SETTINGS };
	public templateService!: TemplateService;
	public modalService!: ModalService;
	private readingComponents = new WeakMap<
		HTMLElement,
		ReturnType<typeof mount>
	>();

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingsTab(this.app, this));

		const getFolder = () => this.settings.templateFolder;

		this.templateService = new TemplateService(this, getFolder);
		this.modalService = new ModalService(this, getFolder);

		this.templateService.onLoad();
		this.modalService.onLoad();

		this.registerEditorExtension(infoboxExtension(this.templateService));
		const update = () =>
			window.setTimeout(() => this.renderReadingInfoboxes(), 50);

		this.app.workspace.onLayoutReady(update);
		this.registerEvent(this.app.workspace.on('layout-change', update));
		this.registerEvent(this.app.workspace.on('active-leaf-change', update));
		this.registerEvent(this.app.workspace.on('file-open', update));
		this.registerEvent(this.app.metadataCache.on('changed', update));

		this.registerEvent(
			this.app.metadataCache.on('changed', () => {
				this.app.workspace.iterateAllLeaves((leaf) => {
					if (!(leaf.view instanceof MarkdownView)) return;
					const cm = (
						leaf.view.editor as unknown as { cm?: EditorView }
					).cm;
					cm?.dispatch({ effects: refreshInfobox.of(null) });
				});
			}),
		);
	}

	onunload() {
		this.templateService.onUnload();
		this.modalService.onUnload();

		document
			.querySelectorAll<HTMLElement>('.antra-infobox-host')
			.forEach((el) => {
				const comp = this.readingComponents.get(el);
				if (comp) void unmount(comp);
				el.remove();
			});
		document
			.querySelectorAll('.antra-resource')
			.forEach((el) => el.removeClass('antra-resource'));
	}

	async loadSettings() {
		const raw = (await this.loadData()) as unknown;
		const settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			raw as Partial<AntraSettings>,
		);
		this.settings = settings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.refreshViews();
	}

	public refreshViews() {
		this.templateService?.snapshotSchemas();
		window.setTimeout(() => this.renderReadingInfoboxes(), 50);
		this.app.workspace.iterateAllLeaves((leaf) => {
			if (!(leaf.view instanceof MarkdownView)) return;
			const cm = (
				leaf.view.editor as unknown as { cm?: EditorView }
			).cm;
			cm?.dispatch({ effects: refreshInfobox.of(null) });
		});
	}

	private renderReadingInfoboxes() {
		this.updateResourceClasses();
		this.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (
				!(view instanceof MarkdownView) ||
				view.getMode() !== 'preview' ||
				!view.file
			)
				return;

			const sizer =
				view.previewMode.containerEl.querySelector<HTMLElement>(
					'.markdown-preview-sizer',
				);
			if (!sizer) return;

			sizer
				.querySelectorAll<HTMLElement>('.antra-infobox-host')
				.forEach((old) => {
					const comp = this.readingComponents.get(old);
					if (comp) void unmount(comp);
					old.remove();
				});

			const data = this.templateService.getInfoboxData(view.file);
			if (!data) return;

			const host = createDiv({ cls: 'antra-infobox-host' });
			this.readingComponents.set(
				host,
				mount(Infobox, {
					target: host,
					props: createInfoboxProps(this.templateService, data),
				}),
			);
			const metadata = sizer.querySelector('.metadata-container');
			if (metadata) metadata.after(host);
			else sizer.prepend(host);
		});
	}

	private updateResourceClasses() {
		this.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (!(view instanceof MarkdownView)) return;
			const isResource =
				!!view.file &&
				this.templateService.getTemplateOf(view.file) !== null;
			view.containerEl.toggleClass('antra-resource', isResource);
		});
	}
}
