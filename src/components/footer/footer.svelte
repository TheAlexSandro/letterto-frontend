<script lang="ts">
    import './page.css';
    import { PUBLIC_TGUSN } from '$env/static/public';

    const getYear = () => {
        const dt = new Date();
        const y = dt.getFullYear();
        return y === 2026 ? y : `2026-${y}`
    }
</script>

<footer>
    <p>Copyright © {getYear()} LetterTo. All rights reserved.</p>
    <div class="nav">
        <a href="https://t.me/{PUBLIC_TGUSN}" target="_blank">Report error</a>
    </div>
</footer>