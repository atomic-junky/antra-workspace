<script lang="ts">
    import type { FieldProps } from './types';
    let { kind, key = '', value, editable, onchange }: FieldProps = $props();

    const inputType = $derived(
        kind === 'number' ? 'number' : kind === 'date' ? 'date' : kind === 'datetime' ? 'datetime-local' : 'text',
    );
    const text = $derived(value == null ? '' : String(value));
    const suffix = $derived(/\(([^()]*)\)\s*$/.exec(key)?.[1]?.trim() ?? '');

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
    <div class="antra-input-with-suffix">
        <input
            type={inputType}
            value={text}
            placeholder="—"
            onblur={e => commit(e.currentTarget.value)}
            onkeydown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        />
        {#if suffix}<span class="antra-input-suffix">{suffix}</span>{/if}
    </div>
{:else}
    <div class="antra-input-with-suffix">
        {text || '—'}{#if text && suffix}<span class="antra-input-suffix ">{suffix}</span>{/if}
    </div>
{/if}
