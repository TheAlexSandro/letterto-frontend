<script lang="ts">
	type ToastType = 'success' | 'error' | 'info' | 'warning';

	let {
		message = '',
		type = 'success' as ToastType,
		show = false
	}: {
		message: string;
		type: ToastType;
		show: boolean;
	} = $props();

	const icons: Record<ToastType, string> = {
		success: '<i class="ri-checkbox-circle-line"></i>',
		error: '<i class="ri-close-circle-line"></i>',
		info: '<i class="ri-information-line"></i>',
		warning: '<i class="ri-error-warning-line"></i>'
	};
</script>

{#if show}
	<section class="toast-cont">
		<div class="toast {type}">
			{@html icons[type]}
			<span>{message}</span>

			<button aria-labelledby="close" class="close-btn" onclick={() => (show = false)}>
				<i class="ri-close-line"></i>
			</button>
		</div>
	</section>
{/if}

<style>
	.toast-cont {
		z-index: 99999;
	}

	.toast-cont .toast {
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
		padding: 0.75rem 1.25rem;
		border-radius: 8px;
		color: white;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		z-index: 9999;
		animation: slidein 0.3s ease;
	}

	.toast-cont .toast .close-btn {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		padding: 0;
		margin-left: 0.5rem;
		display: flex;
		align-items: center;
		font-size: 1.1rem;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.toast-cont .toast .close-btn:hover {
		opacity: 1;
	}

	.toast-cont :global(.toast.success) {
		background: #22c55e;
	}
	.toast-cont :global(.toast.error) {
		background: #ef4444;
	}
	.toast-cont :global(.toast.info) {
		background: #3b82f6;
	}
	.toast-cont :global(.toast.warning) {
		background: #f59e0b;
	}

	@keyframes slidein {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 480px) {
		.toast-cont .toast {
			bottom: auto;
			top: 1rem;
			right: 0.75rem;
			left: 0.75rem;
			max-width: 100%;
			width: auto;
			font-size: 0.82rem;
			border-radius: 10px;
			padding: 0.75rem 1rem;
		}
	}
</style>
