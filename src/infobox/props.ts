import type { FieldActions } from './fields/types';
import type { InfoboxData, TemplateService } from '../services/templates';

export interface InfoboxPropsOptions {
    editable?: boolean;
    onmenu?: (event: MouseEvent) => void;
}

export function createInfoboxProps(
    service: TemplateService,
    data: InfoboxData,
    options: InfoboxPropsOptions = {},
) {
    const actions: FieldActions = {
        pickNote: (onChoose) => service.pickNote(data.path, onChoose),
        openLink: (target) => service.openLink(target, data.path),
    };

    return {
        ...data,
        editable: options.editable ?? false,
        onedit: options.editable
            ? (key: string, value: unknown) =>
                  void service.setProperty(data.path, key, value)
            : undefined,
        onmenu: options.onmenu,
        actions,
    };
}
