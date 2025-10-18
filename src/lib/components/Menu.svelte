<script>
    import {base} from '$app/paths';
    import {page} from '$app/stores';


</script>

<div class="menu">
    <a href="{base}/" class:active={$page.url.pathname === base + '/' || $page.url.pathname === base}>Translate</a>
    <a href="{base}/quiz" class:active={$page.url.pathname === base + '/quiz/'}>Quiz</a>
</div>

<style>
    .menu {
        display: flex;
        gap: 1rem;
        background-color: #f0f0f0;
        padding: 1rem;
        justify-content: center;
    }

    .menu a {
        color: #333;
        text-decoration: none;
        padding: 0 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    .menu a:hover {
        background-color: #C9D2F5;
    }

    .menu a.active {
        background-color: #C9D2F5;
    }

</style>