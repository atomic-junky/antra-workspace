import { ItemView, WorkspaceLeaf } from 'obsidian';
import { mount, unmount } from 'svelte';
import Infobox from './InfoBox.svelte';
import { TemplateService } from '../services/templates';
import { createInfoboxProps } from './props';

export const VIEW_TYPE = 'antra-infobox';

export class InfoboxView extends ItemView {
    private component: ReturnType<typeof mount> | null = null;

    constructor(leaf: WorkspaceLeaf, private service: TemplateService) {
        super(leaf);
    }

    getViewType() { return VIEW_TYPE; }
    getDisplayText() { return 'Infobox'; }

    async onOpen() {
        await this.refresh();
        this.registerEvent(this.app.workspace.on('file-open', () => this.refresh()));
        this.registerEvent(this.app.metadataCache.on('changed', () => this.refresh()));
    }

    private async refresh() {
        if (this.component) await unmount(this.component);
        this.component = null;
        this.contentEl.empty();

        const file = this.app.workspace.getActiveFile();
        if (!file) {
            this.contentEl.setText("Aucun fichier actif.");
            return;
        }
        const data = this.service.getInfoboxData(file);
        if (!data) {
            this.contentEl.setText("Cette note n'est pas une ressource.");
            return;
        }
        this.component = mount(Infobox, {
            target: this.contentEl,
            props: createInfoboxProps(this.service, data),
        });
    }

    async onClose() {
        if (this.component) await unmount(this.component);
    }
}