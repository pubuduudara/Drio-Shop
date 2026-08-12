import { useCallback, useSyncExternalStore } from 'react';

/**
 * The guest wishlist, persisted to localStorage (§7.12).
 *
 * Kept in a module-level store rather than component state so every heart on
 * the page and the header's count badge stay in step without a context
 * provider — subscribing components re-render together when the set changes.
 */

const STORAGE_KEY = 'drio.wishlist';

/*
 * The server renders an empty wishlist. Held as one shared constant rather
 * than returned as a fresh `[]` per call: useSyncExternalStore compares
 * snapshots by identity, and a new array every time reads as a change on every
 * render — React catches that and warns about an infinite loop.
 */
const EMPTY: number[] = [];

let snapshot: number[] = [];
const listeners = new Set<() => void>();

function readStorage(): number[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed)
            ? parsed.filter((id): id is number => typeof id === 'number')
            : [];
    } catch {
        return [];
    }
}

function emit(next: number[]): void {
    // A fresh array identity each time, so useSyncExternalStore sees a change.
    snapshot = next;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // A full or blocked storage quota should not break the interface.
    }

    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener: () => void): () => void {
    if (listeners.size === 0) {
        snapshot = readStorage();
    }

    listeners.add(listener);

    // Another tab writing the same key keeps this one in step.
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            snapshot = readStorage();
            listener();
        }
    };

    window.addEventListener('storage', onStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
    };
}

export function useWishlist(): {
    ids: number[];
    count: number;
    has: (id: number) => boolean;
    toggle: (id: number) => void;
} {
    const ids = useSyncExternalStore(
        subscribe,
        () => snapshot,
        // The real wishlist arrives on hydrate, from localStorage.
        () => EMPTY,
    );

    const toggle = useCallback((id: number): void => {
        const current = readStorage();

        emit(
            current.includes(id)
                ? current.filter((existing) => existing !== id)
                : [...current, id],
        );
    }, []);

    const has = useCallback((id: number): boolean => ids.includes(id), [ids]);

    return { ids, count: ids.length, has, toggle };
}
