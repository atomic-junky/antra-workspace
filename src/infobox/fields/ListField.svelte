<script lang="ts">
    import type { FieldProps } from './types';
    let { value, editable, onchange }: FieldProps = $props();

    const text = $derived(Array.isArray(value) ? value.join(', ') : value == null ? '' : String(value));

    function commit(raw: string) {
        if (raw !== text) onchange(raw.split(',').map(s => s.trim()).filter(Boolean));
    }
</script>

{#if editable}
    <input
        type="text"
        value={text}
        placeholder="a, b, c"
        onblur={e => commit(e.currentTarget.value)}
        onkeydown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
{:else}
    {text || '—'}
{/if}