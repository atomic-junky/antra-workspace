<script lang="ts">
    import type { FieldProps } from './types';
    let { value, editable, onchange }: FieldProps = $props();

    function normalizeBoolean(input: unknown): boolean {
        if (typeof input === 'boolean') return input;
        if (typeof input === 'number') return input !== 0;
        if (typeof input === 'string') {
            const normalized = input.trim().toLowerCase();
            return ['true', 'yes', 'on', '1', 'checked'].includes(normalized);
        }
        return false;
    }

    const val = $derived(normalizeBoolean(value) ? 'true' : 'false');
    let checked = $state(false);

    $effect.pre(() => {
        checked = val === "true";
    });

    function commit(next: boolean) {
        if (next === (val === 'true')) return;
        onchange(next);
    }
</script>

{#if editable}
<input
    type="checkbox"
    bind:checked={checked}
    onchange={e => commit(e.currentTarget.checked)}
    />
{:else}
    {val || '—'}
{/if}
