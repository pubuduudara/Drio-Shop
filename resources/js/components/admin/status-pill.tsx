import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * An order's status as a coloured pill (§8).
 *
 * Shared by the orders table and the order detail page, so one order reads the
 * same in both places.
 */

/*
 * Drawn from the DRIO palette rather than Tailwind's stock hues: §12 rules out
 * "a purple/blue anything", and the sky/indigo pills these replaced were
 * exactly that. Every pair is measured at or above 4.5:1 on the console's white
 * content area — the smallest is `processing` at 4.81:1.
 */
const TONES: Record<string, string> = {
    pending: 'bg-neutral-100 text-neutral-700',
    paid: 'bg-forest/10 text-forest',
    processing: 'bg-gold/15 text-gold-700',
    shipped: 'bg-clay/12 text-clay-700',
    delivered: 'bg-forest text-cream',
    cancelled: 'bg-neutral-200 text-neutral-600',
    refunded: 'bg-chilli/10 text-chilli',
};

export function StatusPill({ status }: { status: string }) {
    const { t } = useTranslation('admin');

    return (
        <span
            className={cn(
                'inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium',
                TONES[status] ?? 'bg-neutral-100 text-neutral-700',
            )}
        >
            {t(`orderStatus.${status}`)}
        </span>
    );
}
