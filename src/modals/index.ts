import { setIcon, TFolder } from "obsidian";
import AntraPlugin from "../main";
import { type Service } from "../types";
import { CreateNoteModal } from "./CreateNoteModal";

export class ModalService implements Service {
    constructor(public plugin: AntraPlugin, public getFolder: () => string) {}

    onLoad() {
        this.plugin.app.workspace.onLayoutReady(() => this.patchExplorerButtons());
        this.plugin.registerEvent(this.plugin.app.workspace.on('layout-change', () => this.patchExplorerButtons()));
        this.plugin.registerEvent(
            this.plugin.app.workspace.on('file-menu', (menu, file) => {
                if (!(file instanceof TFolder)) return;
                menu.addItem(item =>
                    item
                        .setTitle('Nouvelle note')
                        .setIcon('edit')
                        .setSection('action-primary')
                        .onClick(() => this.openCreateModal(file)),
                );
            }),
        );
    }

    onUnload() {
        activeDocument.querySelectorAll('.antra-new-note').forEach(el => el.remove());
        activeDocument.querySelectorAll('.antra-hidden').forEach(el => el.removeClass('antra-hidden'));
    }
    
    private patchExplorerButtons() {
        for (const leaf of this.plugin.app.workspace.getLeavesOfType('file-explorer')) {
            const container = leaf.view.containerEl.querySelector('.nav-buttons-container');
            if (!container || container.querySelector('.antra-new-note')) continue;

            const original = container.querySelector<HTMLElement>('.nav-action-button');
            if (!original) continue;

            const btn = createDiv({
                cls: 'clickable-icon nav-action-button antra-new-note',
                attr: { 'aria-label': 'Nouvelle note' },
            });
            setIcon(btn, 'file-plus');
            btn.addEventListener('click', () => this.openCreateModal());

            original.before(btn);
            original.addClass('antra-hidden');
        }
    }
    
    private openCreateModal(folder?: TFolder) {
        new CreateNoteModal(
            this.plugin.app,
            this.plugin.templateService.getTemplates(),
            (name, template) => this.plugin.templateService.createNote(name, template, folder),
        ).open();
    }
}