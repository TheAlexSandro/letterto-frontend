import { writable } from 'svelte/store';

export const isDeletingLetter = writable(false);
export const openDropdownId = writable<string | null>(null);