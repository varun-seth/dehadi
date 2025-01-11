import * as Icons from '@phosphor-icons/react';
import iconsMetadata from './icons-metadata.json';

export const APP_ICON = 'House';
export const ACTIONS_ICON = 'Check';
export const HABITS_ICON = 'ListBullets';
export const DEFAULT_CHECK_ICON = 'CheckCircle';

export const ICON_PAIRS = iconsMetadata.iconPairs;

export const ICONS = iconsMetadata.icons
    .map(icon => {
        return {
            ...icon,
            component: Icons[icon.name],
        };
    });

export function searchIconForHabit(habitName) {
    if (!habitName || typeof habitName !== 'string') {
        return ICONS[0].name;
    }

    const searchTerms = habitName
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 0);

    const exactMatches = new Array();
    
    for (const term of searchTerms) {
        for (const icon of ICONS) {
            if (icon.tags.some(tag => tag.toLowerCase() === term)) {
                exactMatches.push(icon.name);
            }
        }
    }
    
    if (exactMatches.length > 0) {
        return exactMatches[Math.floor(Math.random() * exactMatches.length)];
    }

    const partialMatches = new Array();
    
    for (const term of searchTerms) {
        for (const icon of ICONS) {
            if (icon.name.toLowerCase().includes(term)) {
                partialMatches.push(icon.name);
            }
        }

        for (const icon of ICONS) {
            if (icon.tags.some(tag => tag.toLowerCase().includes(term))) {
                partialMatches.push(icon.name);
            }
        }
    }
    
    if (partialMatches.length > 0) {
        return partialMatches[Math.floor(Math.random() * partialMatches.length)];
    }
    
    return ICONS[0].name;
}
