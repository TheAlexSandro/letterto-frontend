<script lang="ts">
	import { PUBLIC_STATUS_PAGE } from '$env/static/public';
	import { PUBLIC_TGUSN } from '$env/static/public';

	const getYear = () => {
		const dt = new Date();
		const y = dt.getFullYear();
		return y === 2026 ? y : `2026-${y}`;
	};
</script>

<footer>
	<div class="container">
		<div class="top">
			<div class="left">
				<div class="logo">LetterTo</div>
				<div class="desc">
					Send letter to your beloved. Sometimes the truest words are the ones we're afraid to say.
					LetterTo lets you send them anyway — no fear, just honesty.
				</div>
			</div>

			<div class="menu">
				<div class="card">
					<span>Letter</span>
					<a href="/new">New Letter</a>
					<a href="/dashboard">My Letters</a>
				</div>
				<div class="card">
					<span>Account</span>
					<a href="/auth">Authentication</a>
					<a href="/dashboard/settings">Account Settings</a>
				</div>
				<div class="card">
					<span>Information</span>
					<a href="https://t.me/{PUBLIC_TGUSN}" target="_blank">Support</a>
					<a href={PUBLIC_STATUS_PAGE} target="_blank">Status</a>
				</div>
			</div>
		</div>
		<div class="bottom">
			<div class="copyright">
				&copy; {getYear()} by LetterTo.
			</div>
		</div>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--color-border);
		background: var(--color-background-tertiary, #f5f4fb);
		margin-top: 50px;
		padding: 30px 50px;
		font-size: 0.8rem;
	}

	footer .container {
		display: flex;
		flex-direction: column;
	}

	footer .container .top {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
	}

	footer .container .left {
		display: flex;
		flex-direction: column;
		text-align: left;
		max-width: 40%;
		gap: 10px;
	}

	footer .container .left .logo {
		font-weight: var(--font-bold);
		font-size: 1.4rem;
		color: #333;
		text-decoration: none;
		font-family: 'Playwrite NZ Guides', cursive;
		font-weight: 400;
		font-style: normal;
	}

	footer .container .menu {
		display: flex;
		flex-direction: row;
		gap: 50px;
		font-size: 13px;
	}

	footer .container .menu .card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}

	footer .container .menu .card span {
		font-weight: var(--font-semibold);
		font-size: 14px;
	}

	footer .container .menu .card a {
		text-decoration: none;
		color: black;
	}

	footer .container .menu .card a:hover {
		color: var(--color-accent);
	}

	footer .container .bottom {
		margin-top: 30px;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		color: var(--color-menu);
	}

	@media screen and (max-width: 767px) {
		footer {
			padding: 20px 30px;
		}

		footer .container .top {
			display: flex;
			flex-direction: column;
		}

		footer .container .left {
			max-width: 100%;
			margin-bottom: 20px;
		}

		footer .container .menu {
			gap: 20px;
		}

		footer .container .menu .card {
			gap: 7px;
		}

		footer .container .bottom {
			justify-content: center;
		}
	}
</style>
