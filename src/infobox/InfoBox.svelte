<script lang="ts">
    import { FIELD_COMPONENTS } from './fields';
    import type { FieldActions } from './fields/types';

    type Row = { key: string; kind: string; value: unknown };

    let { title, rows, image = null, editable = false, onedit, onmenu, actions }: {
        title: string;
        rows: Row[];
        image?: string | null;
        editable?: boolean;
        onedit?: (key: string, value: unknown) => void;
        onmenu?: (evt: MouseEvent) => void;
        actions: FieldActions;
    } = $props();
</script>

<aside class="antra-infobox">
    <div class="infobox-header">
        <span></span>
        <h1>{title}</h1>
        {#if editable}
            <div class="titlebar-buttons">
                <button class="icon-btn" aria-label="Options" title="Options" onclick={e => onmenu?.(e)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                    </svg>
                </button>
            </div>
        {:else}
            <span></span>
        {/if}
    </div>

    {#if image}
        <img class="cover" src={image} alt={title} />
    {/if}

    <div class="infobox-content">
        <table>
            <tbody>
                {#each rows as row (row.key)}
                    {@const Field = FIELD_COMPONENTS[row.kind] ?? FIELD_COMPONENTS.text}
                    <tr>
                        <th class="antra-property-name">{row.key}</th>
                        <td>
                            <Field
                                kind={row.kind}
                                value={row.value}
                                {editable}
                                {actions}
                                onchange={(value: unknown) => onedit?.(row.key, value)}
                            />
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</aside>
