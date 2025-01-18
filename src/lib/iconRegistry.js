import iconsMetadata from './icons-metadata.json';
import { Icons } from './iconsSubset.jsx';

// Icons is now imported from iconsSubset.jsx

// Check for unique slugs in iconsMetadata.icons
const slugSet = new Set();
const duplicateSlugs = [];

for (const icon of iconsMetadata.icons) {
    if (icon.slug == null) continue;
    if (slugSet.has(icon.slug)) {
        duplicateSlugs.push(icon.slug);
    }
    slugSet.add(icon.slug);
}
if (duplicateSlugs.length > 0) {
    throw new Error(
        `Duplicate icon slugs found: ${duplicateSlugs.join(', ')}`
    );
}

export const APP_ICON = 'House';
export const ACTIONS_ICON = 'Check';
export const HABITS_ICON = 'ListBullets';
export const DEFAULT_CHECK_ICON_SLUG = 'check-circle';
export const DEFAULT_CHECK_ICON = 'CheckCircle';
export const DEFAULT_EMPTY_ICON_SLUG = 'circle';
export const DEFAULT_EMPTY_ICON = 'Circle';

export const ICON_PAIRS = iconsMetadata.iconPairs;

export const ICONS = iconsMetadata.icons
    .filter(icon => icon.slug != null)
    .map(icon => ({
        ...icon,
        component: Icons[icon.name],
    }));
// Dynamically import a phosphor icon by name
export async function getPhosphorIcon(iconName) {
    const module = await import('@phosphor-icons/react');
    return module[iconName];
}
    
// Icon slug is stable
// Icon Name may change if we switch icon sets (like from Phosphor to FontAwesome etc)
export const ICON_SLUG_TO_NAME = {};
for (const icon of ICONS) {
    ICON_SLUG_TO_NAME[icon.slug] = icon.name;
}

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
