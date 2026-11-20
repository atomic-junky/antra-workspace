export interface FieldActions {
    pickNote(onChoose: (link: string) => void): void;
    openLink(target: string): void;
}

export interface FieldProps {
    kind: string;
    key?: string;
    value: unknown;
    editable: boolean;
    onchange: (value: unknown) => void;
    actions: FieldActions;
}