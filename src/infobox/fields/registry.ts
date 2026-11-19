export interface DetectContext {
	widget: string | null | undefined;
	templateValue: unknown;
}

export interface FieldType {
	kind: string;
	detect(c: DetectContext): boolean;
}

export const FIELD_TYPES: FieldType[] = [
	{
		kind: 'note',
		detect: (c) =>
			typeof c.templateValue === 'string' &&
			/^\[\[.*\]\]$/.test(c.templateValue.trim()),
	},
	{
		kind: 'list',
		detect: (c) =>
			['multitext', 'tags', 'aliases'].includes(c.widget ?? '') ||
			Array.isArray(c.templateValue),
	},
	{
		kind: 'number',
		detect: (c) =>
			c.widget === 'number' || typeof c.templateValue === 'number',
	},
	{
		kind: 'checkbox',
		detect: (c) =>
			c.widget === 'checkbox' || typeof c.templateValue === 'boolean',
	},
	{ kind: 'datetime', detect: (c) => c.widget === 'datetime' },
	{ kind: 'date', detect: (c) => c.widget === 'date' },
	{ kind: 'text', detect: () => true },
];

export function detectKind(c: DetectContext): string {
	return FIELD_TYPES.find((t) => t.detect(c))?.kind ?? 'text';
}
