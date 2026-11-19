import { App, PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import AntraPlugin from "../main.js";
import { type AntraSettings } from "../types.js";

export const DEFAULT_SETTINGS: AntraSettings = {
	templateFolder: "",
	uppercasePropertyNames: true,
};

export class SettingsTab extends PluginSettingTab {
    constructor(app: App, plugin: AntraPlugin) {
        super(app, plugin);
        this.app = app;
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
				name: "Uppercase property names",
				desc: "Display property names in uppercase.",
				control: {
					type: 'toggle',
					key: 'uppercasePropertyNames'
				}
			}]
		});

        return items;
    }
}
