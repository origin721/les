import { writable } from "svelte/store";
import { KEYS } from "../core/local-storage/constants";

export const themes = ["cyberpunk", "watchdogs", "pixel", "terminal", "arabic"];

// Получаем начальную тему из localStorage или используем первую по умолчанию
function getInitialTheme() {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem(KEYS.SELECTED_THEME);
        if (savedTheme && themes.includes(savedTheme)) {
            return savedTheme;
        }
    }
    return themes[0];
}

export const theme = writable(getInitialTheme());

// Сохраняем тему при изменении
theme.subscribe((value) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.SELECTED_THEME, value);
        // Применяем data-theme атрибут к body (не класс!)
        document.body.setAttribute('data-theme', value);
    }
});

export function toggleTheme() {
    theme.update((currentTheme) => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        return themes[nextIndex];
    });
}

export function setTheme(selectedTheme: string) {
    if (themes.includes(selectedTheme)) {
        theme.set(selectedTheme);
    }
}
