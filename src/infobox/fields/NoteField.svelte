<script lang="ts">
	import type { FieldProps } from './types';
	let { value, editable, onchange, actions }: FieldProps = $props();

	const link = $derived.by(() => {
		if (typeof value !== 'string') return null;
		const m = /^\[\[([^\]|]*)(?:\|([^\]]*))?\]\]$/.exec(value.trim());
		const target = m?.[1];
		if (!target) return null;
		return { target, label: m[2] ?? target.split('/').pop() ?? target };
	});
</script>

{#if link}
	<span
		class="internal-link"
		role="link"
		tabindex="0"
		onclick={() => actions.openLink(link.target)}
		onkeydown={(e) => {
			if (e.key === 'Enter') actions.openLink(link.target);
		}}>
			{link.label}
	</span>
	{#if editable}
		<div class="antra-infobox-actions">
			<button
				class="antra-infobox-mini"
				aria-label="Update"
				onclick={() => actions.pickNote(onchange)}>
					✎
			</button>
			<button class="antra-infobox-mini" aria-label="Remove" onclick={() => onchange('')}>
				×
			</button>
		</div>
	{/if}
{:else if editable}
	<button onclick={() => actions.pickNote(onchange)}>Choisir une note…</button>
{:else}
	—
{/if}
