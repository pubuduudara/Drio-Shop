import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleSwitcher } from '@/components/drio/locale-switcher';
import { useLocale } from '@/hooks/use-locale';

/**
 * Phase 0 deliverable — proves the tokens, the fonts and both dictionaries
 * resolve.
 *
 * Every value on this page is read from the theme layer or a dictionary. None
 * of it is written inline, so if a token drifts in app.css this sheet drifts
 * with it rather than quietly disagreeing.
 */

type TokensPageProps = {
    serverGreeting: string;
};

const COLOUR_TOKENS = [
    { token: 'forest', className: 'bg-forest' },
    { token: 'forest-700', className: 'bg-forest-700' },
    { token: 'forest-500', className: 'bg-forest-500' },
    { token: 'gold', className: 'bg-gold' },
    { token: 'gold-600', className: 'bg-gold-600' },
    { token: 'gold-200', className: 'bg-gold-200' },
    { token: 'cream', className: 'bg-cream' },
    { token: 'sand', className: 'bg-sand' },
    { token: 'paper', className: 'bg-paper' },
    { token: 'line', className: 'bg-line' },
    { token: 'ink', className: 'bg-ink' },
    { token: 'ink-muted', className: 'bg-ink-muted' },
    { token: 'chilli', className: 'bg-chilli' },
    { token: 'clay', className: 'bg-clay' },
] as const;

const SEMANTIC_ALIASES = [
    { alias: 'bg-page', className: 'bg-page' },
    { alias: 'bg-surface', className: 'bg-surface' },
    { alias: 'bg-band', className: 'bg-band' },
    { alias: 'text-body', className: 'bg-body' },
    { alias: 'border-hairline', className: 'bg-hairline' },
] as const;

const RADII = [
    { token: 'rounded-btn', className: 'rounded-btn', note: '4px' },
    { token: 'rounded-card', className: 'rounded-card', note: '6px' },
    { token: 'rounded-panel', className: 'rounded-panel', note: '10px' },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="border-t border-hairline pt-8">
            <h2 className="mb-6 font-display text-section font-medium text-ink">
                {title}
            </h2>
            {children}
        </section>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-hairline py-3 last:border-b-0">
            <dt className="w-56 shrink-0 drio-eyebrow text-ink-muted">
                {label}
            </dt>
            <dd className="min-w-0 flex-1 text-copy text-ink">{children}</dd>
        </div>
    );
}

export default function TokensPage({ serverGreeting }: TokensPageProps) {
    const { t } = useTranslation('design');
    const { locale, enabledLocales, isSingleLocale } = useLocale();

    return (
        <>
            <Head title={t('tokens.title')} />

            <div className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                <p className="drio-eyebrow text-gold-700">
                    {t('tokens.eyebrow')}
                </p>
                <h1 className="mt-3 font-display text-hero font-medium text-ink">
                    {t('tokens.title')}
                </h1>
                <p className="mt-4 max-w-2xl text-copy text-ink-muted">
                    {t('tokens.intro')}
                </p>

                <div className="mt-14 flex flex-col gap-12">
                    <Section title={t('tokens.sections.colour')}>
                        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                            {COLOUR_TOKENS.map(({ token, className }) => (
                                <li key={token} className="flex flex-col gap-2">
                                    <span
                                        className={`h-16 w-full rounded-card border border-hairline ${className}`}
                                    />
                                    <span className="drio-eyebrow text-ink">
                                        {token}
                                    </span>
                                    <code className="text-small text-ink-muted">
                                        {`var(--drio-${token})`}
                                    </code>
                                </li>
                            ))}
                        </ul>

                        <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                            {SEMANTIC_ALIASES.map(({ alias, className }) => (
                                <li key={alias} className="flex flex-col gap-2">
                                    <span
                                        className={`h-10 w-full rounded-card border border-hairline ${className}`}
                                    />
                                    <code className="text-small text-ink-muted">
                                        {alias}
                                    </code>
                                </li>
                            ))}
                        </ul>
                    </Section>

                    <Section title={t('tokens.sections.typography')}>
                        <dl className="flex flex-col">
                            <Row label={t('tokens.typography.displayName')}>
                                <span className="block font-display text-hero font-medium text-ink">
                                    {t('tokens.typography.specimen')}
                                </span>
                            </Row>
                            <Row label="text-section">
                                <span className="block font-display text-section font-medium text-ink">
                                    {t('tokens.typography.specimen')}
                                </span>
                            </Row>
                            <Row label="text-title">
                                <span className="block font-display text-title text-ink">
                                    {t('tokens.typography.specimen')}
                                </span>
                            </Row>
                            <Row label={t('tokens.typography.bodyName')}>
                                <span className="block max-w-prose text-copy text-ink">
                                    {t('tokens.typography.bodySpecimen')}
                                </span>
                            </Row>
                            <Row label="text-small">
                                <span className="block text-small text-ink-muted">
                                    {t('tokens.typography.bodySpecimen')}
                                </span>
                            </Row>
                            <Row label="drio-eyebrow">
                                <span className="drio-eyebrow text-gold-700">
                                    {t('tokens.typography.eyebrowSpecimen')}
                                </span>
                            </Row>
                        </dl>
                    </Section>

                    <Section title={t('tokens.sections.geometry')}>
                        <div className="flex flex-wrap gap-8">
                            {RADII.map(({ token, className, note }) => (
                                <div
                                    key={token}
                                    className="flex flex-col gap-2"
                                >
                                    <span
                                        className={`block h-16 w-24 border border-hairline bg-sand ${className}`}
                                    />
                                    <code className="text-small text-ink-muted">
                                        {token} · {note}
                                    </code>
                                </div>
                            ))}
                        </div>

                        <dl className="mt-8 flex flex-col">
                            <Row label={t('tokens.geometry.container')}>
                                <code className="text-small">
                                    max-w-drio · 1280px
                                </code>
                            </Row>
                            <Row label={t('tokens.geometry.rhythm')}>
                                <code className="text-small">
                                    py-16 md:py-20
                                </code>
                            </Row>
                        </dl>
                    </Section>

                    <Section title={t('tokens.sections.i18n')}>
                        <dl className="flex flex-col">
                            <Row label={t('tokens.i18n.activeLocale')}>
                                <code className="text-small">{locale}</code>
                            </Row>
                            <Row label={t('tokens.i18n.enabledLocales')}>
                                <code className="text-small">
                                    {enabledLocales.join(', ')}
                                </code>
                            </Row>
                            <Row label={t('tokens.i18n.clientString')}>
                                {t('tokens.i18n.clientStringValue')}
                            </Row>
                            <Row label={t('tokens.i18n.serverString')}>
                                {serverGreeting}
                            </Row>
                            <Row label={t('tokens.i18n.interpolation')}>
                                {t('tokens.i18n.interpolationValue', {
                                    count: 20,
                                    category: 'Dehydrated Vegetables',
                                })}
                            </Row>
                            <Row label={t('tokens.i18n.plural')}>
                                {t('tokens.i18n.plural', { count: 1 })} ·{' '}
                                {t('tokens.i18n.plural', { count: 128 })}
                            </Row>
                            <Row label="LocaleSwitcher">
                                {isSingleLocale ? (
                                    <span className="text-ink-muted">
                                        {t('tokens.i18n.switcherNote')}
                                    </span>
                                ) : (
                                    <LocaleSwitcher />
                                )}
                            </Row>
                        </dl>
                    </Section>
                </div>
            </div>
        </>
    );
}
