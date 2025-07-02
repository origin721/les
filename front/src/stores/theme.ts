import { writable } from "svelte/store";

export const themes = ["cyberpunk", "watchdogs", "pixel", "terminal"];

export const theme = writable(themes[0]);

export function toggleTheme() {
    theme.update((currentTheme) => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        return themes[nextIndex];
    });
}
