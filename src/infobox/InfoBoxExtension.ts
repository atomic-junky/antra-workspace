import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { EditorState, StateEffect, StateField, Transaction } from '@codemirror/state';
import { editorInfoField, editorLivePreviewField, Menu } from 'obsidian';
import InfoBox from './InfoBox.svelte';
import { type InfoboxData, TemplateService } from '../services/templates';
import { mount, unmount } from 'svelte';
import { createInfoboxProps } from './props';

export const refreshInfobox = StateEffect.define<null>();

class InfoboxWidget extends WidgetType {
    private component: ReturnType<typeof mount> | null = null;

    constructor(private data: InfoboxData, private service: TemplateService) {
        super();
    }

    eq(other: InfoboxWidget) {
        return JSON.stringify(this.data) === JSON.stringify(other.data);
    }

    toDOM() {
        const el = createDiv({ cls: 'antra-infobox-host' });

        this.component = mount(InfoBox, {
            target: el,
            props: createInfoboxProps(this.service, this.data, {
                editable: true,
                onmenu: (evt: MouseEvent) => {
                    const menu = new Menu();
                    menu.addItem(item =>
                        item
                            .setTitle(this.data.image ? "Update cover" : 'Add a cover')
                            .setSection('cover')
                            .onClick(() => this.service.openImagePicker(this.data.path)),
                    );
                    if (this.data.image) {
                        menu.addItem(item =>
                            item
                                .setTitle("Remove cover")
                                .setSection('cover')
                                .onClick(() => void this.service.setImage(this.data.path, null)),
                        );
                    }
                    menu.showAtMouseEvent(evt);
                },
            }),
        });
        return el;
    }

    destroy() {
        if (this.component) void unmount(this.component);
    }

    ignoreEvent() {
        return true;
    }

    update(deco: DecorationSet, tr: Transaction): DecorationSet {
        const modeChanged =
            tr.state.field(editorLivePreviewField, false) !==
            tr.startState.field(editorLivePreviewField, false);

        if (modeChanged || tr.effects.some(e => e.is(refreshInfobox))) {
            return build(tr.state, this.service);
        }
        if (tr.docChanged) return deco.map(tr.changes);
        return deco;
    }
}

function build(state: EditorState, service: TemplateService): DecorationSet {
    const file = state.field(editorInfoField, false)?.file;
    if (!file || !state.field(editorLivePreviewField, false)) return Decoration.none;

    const data = service.getInfoboxData(file);
    if (!data) return Decoration.none;

    const fmEnd = service.plugin.app.metadataCache.getFileCache(file)?.frontmatterPosition?.end.line;
    const startLine = fmEnd === undefined ? 1 : fmEnd + 2;
    if (startLine > state.doc.lines) return Decoration.none;
    const pos = state.doc.line(startLine).from;

    return Decoration.set([
        Decoration.widget({ widget: new InfoboxWidget(data, service), side: -1 }).range(pos),
    ]);
}

export function infoboxExtension(service: TemplateService) {
    return StateField.define<DecorationSet>({
        create: state => build(state, service),
        update(deco, tr) {
            const modeChanged =
                tr.state.field(editorLivePreviewField, false) !==
                tr.startState.field(editorLivePreviewField, false);

            if (modeChanged || tr.effects.some(e => e.is(refreshInfobox))) {
                return build(tr.state, service);
            }
            if (tr.docChanged) return deco.map(tr.changes);
            return deco;
        },
        provide: f => EditorView.decorations.from(f),
    });
}
