<script lang="ts">
	import { PUBLIC_STATUS_PAGE } from '$env/static/public';

	const getYear = () => {
		const dt = new Date();
		const y = dt.getFullYear();
		return y === 2026 ? y : `2026-${y}`;
	};
</script>

<footer>
	<p>Copyright © {getYear()} LetterTo. All rights reserved.</p>
	<div class="nav">
		<a href="https://t.me/kcpix" target="_blank">Support</a>
		<a href={PUBLIC_STATUS_PAGE} target="_blank">Status</a>
	</div>
</footer>

<style>
	footer {
		margin-top: 50px;
		background: #24292e;
		padding: 20px;
		color: var(--color-primary-light);
		text-align: center;
		font-size: 0.8rem;
	}

	footer .nav {
		margin-top: 10px;
		display: flex;
		flex-direction: row;
		gap: 15px;
		align-items: center;
		justify-content: center;
	}

	footer .nav a {
		color: var(--color-secondary);
	}
</style>
