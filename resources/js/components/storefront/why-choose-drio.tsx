import { useTranslation } from 'react-i18next';
import { BotanicalFlourish } from '@/components/drio/icons/botanical';
import {
    FEATURE_ICON_KEYS,
    FeatureIcon,
} from '@/components/drio/icons/feature';
import { useReveal } from '@/hooks/use-reveal';

/**
 * Why Choose DRIO (§7.5).
 *
 * Five thin-stroke icons in circular `line` outlines with a label beneath,
 * wrapping 5 → 3+2 → 2-up.
 */
export function WhyChooseDrio() {
    const { t } = useTranslation('home');

    return (
        <section className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
            <div className="flex items-center justify-center gap-4">
                <BotanicalFlourish className="hidden -scale-x-100 text-gold sm:block" />
                <h2 className="text-center font-display text-section font-medium text-ink">
                    {t('whyChoose.title')}
                </h2>
                <BotanicalFlourish className="hidden text-gold sm:block" />
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                {FEATURE_ICON_KEYS.map((key, index) => (
                    <Feature key={key} iconKey={key} index={index} />
                ))}
            </ul>
        </section>
    );
}

function Feature({
    iconKey,
    index,
}: {
    iconKey: (typeof FEATURE_ICON_KEYS)[number];
    index: number;
}) {
    const { t } = useTranslation('home');
    const ref = useReveal<HTMLLIElement>({ delay: index * 60 });

    /*
     * The reference shows a second, smaller Japanese line under each label.
     * It is omitted in the English-only build, but the slot is real: when a
     * `sublabel` key exists in the active locale's dictionary it renders, and
     * the row does not shift either way because the label block is centred
     * and the sublabel sits below the baseline row (§7.5).
     */
    const sublabelKey = `whyChoose.features.${iconKey}.sublabel`;
    const sublabel = t(sublabelKey, { defaultValue: '' });

    return (
        <li
            ref={ref}
            className="flex drio-reveal flex-col items-center gap-3 text-center"
        >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line text-ink">
                <FeatureIcon iconKey={iconKey} width={26} height={26} />
            </span>

            <span className="flex flex-col items-center gap-1">
                <span className="max-w-[16ch] text-copy leading-snug font-medium text-ink">
                    {t(`whyChoose.features.${iconKey}.label`)}
                </span>

                {sublabel !== '' && (
                    <span className="text-[11px] leading-snug text-ink-muted">
                        {sublabel}
                    </span>
                )}
            </span>
        </li>
    );
}
