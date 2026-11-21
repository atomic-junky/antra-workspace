import { App, PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import AntraPlugin from "../main.js";
import { type AntraSettings } from "../types.js";

export const DEFAULT_SETTINGS: AntraSettings = {
	templateFolder: "",
	capitalizePropertyNames: true,
};

export class SettingsTab extends PluginSettingTab {
    private plugin: AntraPlugin;

    constructor(app: App, plugin: AntraPlugin) {
        super(app, plugin);
        this.app = app;
        this.plugin = plugin;
    }

    getSettingDefinitions(): SettingDefinitionItem<keyof AntraSettings>[] {
        const items: SettingDefinitionItem<keyof AntraSettings>[] = [];

        items.push({
            type: 'group',
            items: [{
                name: "Template folder",
                desc: "Files in this folder will be used as templates for your resources.",
                control: {
                    type: 'folder',
                    key: 'templateFolder',
                }
            }]
		});

		items.push({
			type: 'group',
			items: [{
				name: "Capitalize property names",
				desc: "Capitalize the first letter of property names.",
				control: {
					type: 'toggle',
					key: 'capitalizePropertyNames'
				}
			}]
		});

        return items;
    }

    async setControlValue(
        key: string,
        value: unknown,
    ): Promise<void> {
        if (key === 'templateFolder') {
            this.plugin.settings.templateFolder =
                typeof value === 'string' ? value : '';
        } else if (key === 'capitalizePropertyNames') {
            this.plugin.settings.capitalizePropertyNames =
                typeof value === 'boolean' ? value : false;
        } else {
            return;
        }
        await this.plugin.saveSettings();
    }
}
