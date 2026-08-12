import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '@/components/drio/button';
import {
    BotanicalFlourish,
    BotanicalRule,
} from '@/components/drio/icons/botanical';
import { FeatureIcon } from '@/components/drio/icons/feature';
import type { FeatureIconKey } from '@/components/drio/icons/feature';
import { Media } from '@/components/drio/media';
import { StorefrontPageHeader } from '@/components/storefront/page-header';
import { useReveal } from '@/hooks/use-reveal';
import { home, shop } from '@/routes';
import { index as recipesIndex } from '@/routes/recipes';

/**
 * About / Our Story (§7.12).
 *
 * The homepage's Our Story panel (§7.6) is the teaser; this is the page it
 * leads to, so the two share the same heading and the same voice.
 */
export default function About() {
    const { t } = useTranslation(['pages', 'nav']);

    const values = ['sourcing', 'process', 'delivery'] as const;
    const icons = ['imported', 'natural', 'delivery'] as const;

    return (
        <>
            <Head title={t('pages:about.eyebrow')} />

            <StorefrontPageHeader
                eyebrow={t('pages:about.eyebrow')}
                title={t('pages:about.title')}
                description={t('pages:about.description')}
                crumbs={[
                    { label: t('nav:primary.home'), href: home().url },
                    { label: t('nav:primary.about') },
                ]}
            />

            <section className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="font-display text-2xl font-medium text-ink">
                                {t('pages:about.intro.heading')}
                            </h2>
                            <BotanicalRule
                                className="mt-1 shrink-0 text-gold"
                                aria-hidden
                            />
                        </div>

                        <p className="text-copy text-ink-muted">
                            {t('pages:about.intro.body')}
                        </p>
                        <p className="text-copy text-ink-muted">
                            {t('pages:about.intro.second')}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-panel border border-hairline">
                        <Media
                            ratio="4/3"
                            label="Our Story — the drying yard in Sri Lanka"
                        />
                    </div>
                </div>
            </section>

            <section className="bg-band">
                <div className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <BotanicalFlourish className="text-gold" aria-hidden />
                        <h2 className="font-display text-section font-medium text-ink">
                            {t('pages:about.values.title')}
                        </h2>
                    </div>

                    <ul className="mt-10 grid gap-6 sm:grid-cols-3">
                        {values.map((value, index) => (
                            <Value
                                key={value}
                                index={index}
                                iconKey={icons[index]}
                                title={t(`pages:about.values.${value}.title`)}
                                body={t(`pages:about.values.${value}.body`)}
                            />
                        ))}
                    </ul>
                </div>
            </section>

            <section className="mx-auto max-w-drio px-5 py-16 text-center md:px-8 md:py-20 lg:px-10">
                <h2 className="font-display text-section font-medium text-ink">
                    {t('pages:about.cta.title')}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-copy text-ink-muted">
                    {t('pages:about.cta.body')}
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <ButtonLink href={shop()} variant="primary" size="lg">
                        {t('pages:about.cta.shop')}
                    </ButtonLink>
                    <ButtonLink
                        href={recipesIndex()}
                        variant="outline"
                        size="lg"
                        withArrow
                    >
                        {t('pages:about.cta.recipes')}
                    </ButtonLink>
                </div>
            </section>
        </>
    );
}

function Value({
    index,
    iconKey,
    title,
    body,
}: {
    index: number;
    iconKey: FeatureIconKey;
    title: string;
    body: string;
}) {
    const ref = useReveal<HTMLLIElement>({ delay: index * 60 });

    return (
        <li
            ref={ref}
            className="flex drio-reveal flex-col items-center gap-3 text-center"
        >
            <span className="flex size-14 items-center justify-center rounded-full border border-line text-forest">
                <FeatureIcon iconKey={iconKey} width={24} height={24} />
            </span>
            <h3 className="font-display text-title font-medium text-ink">
                {title}
            </h3>
            <p className="max-w-xs text-small text-ink-muted">{body}</p>
        </li>
    );
}
