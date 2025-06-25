<div class="spinner3"></div>

<style>
    .spinner3 {
        width: 40px;
        height: 40px;
        background-color: var(--primary-color);
        border-radius: 100%;
        animation: pulse 1s infinite ease-in-out;
    }

    @keyframes pulse {
        0% {
            transform: scale(0);
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
</style>
