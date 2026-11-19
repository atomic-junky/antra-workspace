<script lang="ts">
    import type { FieldProps } from './types';
    let { kind, value, editable, onchange }: FieldProps = $props();

    const inputType = $derived(
        kind === 'number' ? 'number' : kind === 'date' ? 'date' : kind === 'datetime' ? 'datetime-local' : 'text',
    );
    const text = $derived(value == null ? '' : String(value));

    function commit(raw: string) {
        if (raw === text) return;
        if (kind === 'number') {
            const n = Number(raw);
            onchange(raw.trim() === '' ? null : Number.isNaN(n) ? raw : n);
        } else {
            onchange(raw);
        }
    }
</script>

{#if editable}
    <input
        type={inputType}
        value={text}
        placeholder="—"
        onblur={e => commit(e.currentTarget.value)}
        onkeydown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
{:else}
    {text || '—'}
{/if}
