import * as Icons from 'lucide-react';
import iconsMetadata from './icons-metadata.json';

export const ICON_PAIRS = iconsMetadata.iconPairs;

export const ICONS = iconsMetadata.icons.map(icon => ({
    ...icon,
    component: Icons[icon.name]
}));

export function searchIconForHabit(habitName) {
    if (!habitName || typeof habitName !== 'string') {
        return ICONS[0].name;
    }

    const searchTerms = habitName
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 0);

    const searchResults = new Array();
    for (const term of searchTerms) {
        for (const icon of ICONS) {
            if (icon.name.toLowerCase().includes(term)) {
                searchResults.push(icon.name);
            }
        }

        for (const icon of ICONS) {
            if (icon.tags.some(tag => tag.includes(term) || term.includes(tag))) {
                searchResults.push(icon.name);
            }
        }

        for (const icon of ICONS) {
            if (icon.description.toLowerCase().includes(term)) {
                searchResults.push(icon.name);
            }
        }
    }
    // randomly select one from the search results, higher chance for better matches
    if (searchResults.length > 0) {
        return searchResults[Math.floor(Math.random() * searchResults.length)];
    }
    return ICONS[0].name;
}
