<script lang="ts">
	import { onMount } from 'svelte';
	import '../page.css';
	import './page.css';
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import { showToast } from '$lib/toast';
	import { isLoggedIn } from '$lib/utils/utils';

	type AdminUser = {
		id: number;
		name: string;
		username: string;
		role: string;
	};

	const LIMIT = 20;

	let users = $state<AdminUser[]>([]);
	let total = $state(0);
	let offset = $state(0);
	let searchTerm = $state('');
	let loading = $state(false);
	let errorMsg = $state('');
	let actionLoadingId = $state<number | null>(null);
	let windowLoad = $state(true);

	let passwordModalUser = $state<AdminUser | null>(null);
	let newPassword = $state('');
	let savingPassword = $state(false);
	let passwordError = $state('');
	let passwordInputEl = $state<HTMLInputElement | null>(null);
	let filterRole = $state('user');
	let filter = $state(false);

	const totalPages = $derived(Math.max(1, Math.ceil(total / LIMIT)));
	const currentPage = $derived(Math.floor(offset / LIMIT) + 1);
	const isSearching = $derived(searchTerm.trim().length > 0 || filterRole);

	let searchDebounce: ReturnType<typeof setTimeout>;

	const fetchUsers = async () => {
		loading = true;
		errorMsg = '';
		try {
			const useSearch = isSearching;
			const param = searchTerm ? `name=${searchTerm.trim()}` : `role=${filterRole}`;
			const url = useSearch
				? `/api/req?path=user&ep=searchUser&${param}&offset=${String(offset)}`
				: `/api/req?path=user&ep=users&offset=${String(offset)}`;

			const res = await fetch(url);
			const json = (await res.json()) as any;

			if (!res.ok || !json.ok) {
				errorMsg = json.message ?? 'Gagal memuat data user';
				users = [];
				total = 0;
				return;
			}

			users = json.data?.users ?? [];
			total = json.data?.total ?? 0;
		} catch (e) {
			console.log(e);
			errorMsg = 'Tidak bisa terhubung ke server';
			users = [];
			total = 0;
			windowLoad = false;
		} finally {
			loading = false;
		}
	};

	const onSearchInput = () => {
		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(() => {
			offset = 0;
			fetchUsers();
		}, 350);
	};

	const clearSearch = () => {
		searchTerm = '';
		offset = 0;
		fetchUsers();
	};

	const goToPage = (page: number) => {
		if (page < 1 || page > totalPages || loading) return;
		offset = (page - 1) * LIMIT;
		fetchUsers();
	};

	const openFilter = () => {
		filter = !filter;
	};

	const toggleBan = async (targetUser: AdminUser, role: string) => {
		actionLoadingId = targetUser.id;
		try {
			const res = await fetch(`/api/req?path=user&ep=changeRole`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: targetUser.id, role })
			});
			const json = (await res.json()) as any;

			if (!res.ok || !json.ok) {
				errorMsg = json.message ?? 'Gagal mengubah status user';
				return;
			}

			window.location.reload();
		} catch (e) {
			errorMsg = 'Tidak bisa terhubung ke server';
		}
	};

	const openPasswordModal = (targetUser: AdminUser) => {
		passwordModalUser = targetUser;
		newPassword = '';
		passwordError = '';
	};

	const closePasswordModal = () => {
		passwordModalUser = null;
		newPassword = '';
		passwordError = '';
	};

	const submitPasswordChange = async () => {
		if (!passwordModalUser) return;
		if (newPassword.trim().length < 8) {
			passwordError = 'Password minimal 8 karakter';
			return;
		}

		savingPassword = true;
		passwordError = '';
		try {
			const res = await fetch('/api/req?path=user&ep=changePass', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: passwordModalUser.id, password: newPassword })
			});
			const json = (await res.json()) as any;

			if (!res.ok || !json.ok) {
				passwordError = json.message ?? 'Gagal mengubah password';
				return;
			}

			closePasswordModal();
			showToast('Password diubah!', 'success');
		} catch (e) {
			passwordError = 'Tidak bisa terhubung ke server';
		} finally {
			savingPassword = false;
		}
	};

	const onWindowKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && passwordModalUser) closePasswordModal();
	};

	const onBackdropClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) closePasswordModal();
	};

	$effect(() => {
		if (passwordModalUser) {
			passwordInputEl?.focus();
		}
	});

	onMount(async () => {
		const loggedIn = await isLoggedIn();
		if (loggedIn === 'error') {
			showToast('Something went wrong, please try again later.', 'error', 5000);
			return;
		}
		if (!loggedIn || !/(admin|owner)/i.exec(loggedIn.role)) {
			window.location.href = '/auth';
			return;
		}

		windowLoad = false;
		fetchUsers();
	});
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />

	<section class="admin">
		<div class="admin-header">
			<h1>Kelola User</h1>
			<span class="admin-total">{total} user terdaftar</span>
		</div>

		<div class="admin-toolbar">
			<div class="search-box">
				<svg
					class="search-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="7" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					placeholder="Cari nama user..."
					bind:value={searchTerm}
					oninput={onSearchInput}
				/>
				{#if searchTerm}
					<button class="clear-search" onclick={clearSearch} aria-label="Hapus pencarian">×</button>
				{/if}
			</div>
			<div class="filter">
				<button onclick={openFilter} aria-labelledby="a">
					<i class="ri-equalizer-3-line"></i>
				</button>
			</div>
		</div>

		{#if errorMsg}
			<div class="admin-error" role="alert">{errorMsg}</div>
		{/if}

		{#if filter}
			<div class="filter-menu">
				<h1>Filter</h1>
				<div class="item">
					<span>Role</span>
					<div class="dropdown-container">
						<div class="custom-select">
							<select bind:value={filterRole} onchange={onSearchInput}>
								<option value="user" selected>User</option>
								<option value="owner">Owner</option>
								<option value="admin">Admin</option>
								<option value="banned">Banned</option>
							</select>
							<i class="ri-arrow-down-s-line"></i>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<div class="table-wrap">
			<table class="user-table">
				<thead>
					<tr>
						<th>User ID</th>
						<th>Nama</th>
						<th>Username</th>
						<th>Status</th>
						<th class="col-actions">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#if loading}
						{#each Array(6) as _}
							<tr class="skeleton-row">
								<td><div class="skeleton"></div></td>
								<td><div class="skeleton"></div></td>
								<td><div class="skeleton"></div></td>
								<td><div class="skeleton skeleton-badge"></div></td>
								<td><div class="skeleton skeleton-actions"></div></td>
							</tr>
						{/each}
					{:else if users.length === 0}
						<tr>
							<td colspan="5" class="empty-state">
								{searchTerm.trim().length > 0
									? `Tidak ada user dengan nama "${searchTerm}"`
									: `Tidak ada pengguna dengan peran ${filterRole}`}
							</td>
						</tr>
					{:else}
						{#each users as u (u.id)}
							<tr>
								<td class="mono">#{u.id}</td>
								<td>{u.name}</td>
								<td class="mono">{u.username}</td>
								<td>
									<span class="badge {u.role === 'banned' ? 'badge-banned' : 'badge-active'}">
										{u.role === 'banned' ? 'Diblokir' : 'Aktif'}
									</span>
								</td>
								<td class="col-actions">
									<button
										class="btn-action {u.role === 'banned' ? 'btn-unban' : 'btn-ban'}"
										disabled={actionLoadingId === u.id}
										onclick={() => toggleBan(u, u.role === 'banned' ? 'user' : 'banned')}
									>
										{actionLoadingId === u.id ? '...' : u.role === 'banned' ? 'Unban' : 'Ban'}
									</button>
									<button class="btn-action btn-password" onclick={() => openPasswordModal(u)}>
										Ganti Password
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		{#if !loading && total > 0}
			<div class="pagination">
				<button
					class="page-btn"
					disabled={currentPage <= 1}
					onclick={() => goToPage(currentPage - 1)}
					aria-labelledby="a"
				>
					<i class="ri-arrow-left-line"></i>
				</button>
				<span class="page-info">{currentPage}/{totalPages}</span>
				<button
					class="page-btn"
					disabled={currentPage >= totalPages}
					onclick={() => goToPage(currentPage + 1)}
					aria-labelledby="a"
				>
					<i class="ri-arrow-right-line"></i>
				</button>
			</div>
		{/if}
	</section>

	{#if passwordModalUser}
		<div class="modal-backdrop" role="presentation" onclick={onBackdropClick}>
			<div class="modal" role="dialog" aria-modal="true" tabindex="-1">
				<h2>Ganti Password</h2>
				<p class="modal-subtitle">
					Untuk user <strong>{passwordModalUser.name}</strong> (@{passwordModalUser.username})
				</p>

				<label for="new-password">Password baru</label>
				<input
					id="new-password"
					type="password"
					placeholder="Minimal 8 karakter"
					bind:value={newPassword}
					bind:this={passwordInputEl}
				/>

				{#if passwordError}
					<p class="modal-error">{passwordError}</p>
				{/if}

				<div class="modal-actions">
					<button class="btn-secondary" onclick={closePasswordModal} disabled={savingPassword}>
						Batal
					</button>
					<button class="btn-primary" onclick={submitPasswordChange} disabled={savingPassword}>
						{savingPassword ? 'Menyimpan...' : 'Simpan'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<Footer />
{/if}
