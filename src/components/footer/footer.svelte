<script lang="ts">
    import './page.css';
    import { PUBLIC_STATUS_PAGE } from '$env/static/public';

    const getYear = () => {
        const dt = new Date();
        const y = dt.getFullYear();
        return y === 2026 ? y : `2026-${y}`
    }
</script>

<footer>
    <p>Copyright © {getYear()} LetterTo. All rights reserved.</p>
    <div class="nav">
        <a href="https://t.me/kcpix" target="_blank">Report bug/error</a>
        <a href="{PUBLIC_STATUS_PAGE}" target="_blank">Status</a>
    </div>
</footer>