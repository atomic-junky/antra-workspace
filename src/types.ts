import type AntraPlugin from "./main";

export type FieldType = "text" | "number" | "link" | "image" | "select";

export type AutoImportOption = "never" | "ask" | "always";

export interface Service {
  plugin: AntraPlugin;
  getFolder(): string;
  onLoad(): void;
  onUnload(): void;
}

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  allowRemote?: boolean;
}

export interface TemplateDef {
  id: string;
  label: string;
  folder: string;
  fields: FieldDef[];
}

export interface AntraSettings {
	templateFolder: string;
	uppercasePropertyNames: boolean;
}
