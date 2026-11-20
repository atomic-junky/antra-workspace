<script lang="ts">
    import InputField from './fields/InputField.svelte';
    import ListField from './fields/ListField.svelte';
    import CheckboxField from './fields/CheckboxField.svelte';
    import NoteField from './fields/NoteField.svelte';
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
                    <tr>
                        <th class="antra-property-name">{row.key}</th>
                        <td>
                            {#if row.kind === 'list'}
                                <ListField kind={row.kind} value={row.value} {editable} {actions}
                                    onchange={(value: unknown) => onedit?.(row.key, value)} />
                            {:else if row.kind === 'checkbox'}
                                <CheckboxField kind={row.kind} value={row.value} {editable} {actions}
                                    onchange={(value: unknown) => onedit?.(row.key, value)} />
                            {:else if row.kind === 'note'}
                                <NoteField kind={row.kind} value={row.value} {editable} {actions}
                                    onchange={(value: unknown) => onedit?.(row.key, value)} />
                            {:else}
                                <InputField kind={row.kind} value={row.value} {editable} {actions}
                                    onchange={(value: unknown) => onedit?.(row.key, value)} />
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</aside>
