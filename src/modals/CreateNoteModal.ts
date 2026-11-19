import { App, Modal, Notice, Setting, TFile, SettingGroup } from 'obsidian';

export class CreateNoteModal extends Modal {
    private name = '';
    private useTemplate: boolean;
    private templatePath: string;

    constructor(
        app: App,
        private templates: TFile[],
        private onSubmit: (name: string, template: TFile | null) => Promise<void>,
    ) {
        super(app);
        this.useTemplate = false;
        this.templatePath = templates[0]?.path ?? '';
    }

    onOpen() {
        this.setTitle('Create a new note');

        new Setting(this.contentEl)
            .setName('Name')
            .addText(text => {
                text.setPlaceholder('Note name').onChange(v => (this.name = v));
                text.inputEl.addEventListener('keydown', e => {
                    if (e.key === 'Enter') void this.submit();
                });
                window.setTimeout(() => text.inputEl.focus(), 0);
            });

        const templateGroup: SettingGroup = new SettingGroup(this.contentEl);
        let templateSetting: Setting | null = null;

        templateGroup.addSetting(setting => {
            setting
                .setName('Create a resource')
                .setDesc(
                    this.templates.length === 0
                        ? 'No template found in the configured folder.'
                        : 'Use a template to create the resource.',
                )
                .setDisabled(this.templates.length === 0)
                .addToggle(toggle => {
                    toggle
                        .setValue(this.useTemplate)
                        .setDisabled(this.templates.length === 0)
                        .onChange(v => {
                            this.useTemplate = v;
                            templateSetting?.settingEl.toggle(v);
                        });
                });
        });

        templateGroup.addSetting(setting => {
            setting
                .setName('Template')
                .setDesc('Select a template to use when creating the resource.')
                .addDropdown(dd => {
                    for (const t of this.templates) dd.addOption(t.path, t.basename);
                    dd.setValue(this.templatePath).onChange(v => (this.templatePath = v));
                });

            templateSetting = setting;
            setting.settingEl.toggle(this.useTemplate);
        });

        templateGroup.addSetting(setting => {
            setting
                .addButton(btn =>
                    btn
                        .setButtonText('Create')
                        .setCta()
                        .onClick(() => void this.submit()),
                );
        });
    }

    private async submit() {
        const name = this.name.trim();
        if (!name) {
            new Notice('You must give the note a name.');
            return;
        }
        const template = this.useTemplate
            ? this.templates.find(t => t.path === this.templatePath) ?? null
            : null;
        this.close();
        await this.onSubmit(name, template);
    }

    onClose() {
        this.contentEl.empty();
    }
}
