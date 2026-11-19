import { App, FuzzySuggestModal, TFile } from 'obsidian';

export class NoteSuggestModal extends FuzzySuggestModal<TFile> {
    constructor(app: App, private notes: TFile[], private onChoose: (f: TFile) => void) {
        super(app);
        this.setPlaceholder('Choisir une note…');
    }
    getItems() { return this.notes; }
    getItemText(f: TFile) { return f.path; }
    onChooseItem(f: TFile) { this.onChoose(f); }
}