import { App, FuzzySuggestModal, TFile } from 'obsidian';

export class ImageSuggestModal extends FuzzySuggestModal<TFile> {
	constructor(
		app: App,
		private images: TFile[],
		private onChoose: (f: TFile) => void,
	) {
		super(app);
		this.setPlaceholder('Choisir une image…');
	}
	getItems() {
		return this.images;
	}
	getItemText(f: TFile) {
		return f.path;
	}
	onChooseItem(f: TFile) {
		this.onChoose(f);
	}
}
