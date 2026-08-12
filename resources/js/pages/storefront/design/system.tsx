import { Head } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, CountBadge } from '@/components/drio/badge';
import { Button, ButtonLink } from '@/components/drio/button';
import { Input, Select, Textarea } from '@/components/drio/field';
import { IconButton } from '@/components/drio/icon-button';
import {
    BotanicalDivider,
    BotanicalFlourish,
    BotanicalRule,
    NewsletterCoconut,
    NewsletterSprig,
    PalmFlourish,
} from '@/components/drio/icons/botanical';
import {
    CATEGORY_ICON_KEYS,
    CategoryIcon,
} from '@/components/drio/icons/category';
import {
    FEATURE_ICON_KEYS,
    FeatureIcon,
} from '@/components/drio/icons/feature';
import { PAYMENT_METHODS, PaymentMark } from '@/components/drio/icons/payment';
import {
    FacebookIcon,
    InstagramIcon,
    YouTubeIcon,
} from '@/components/drio/icons/social';
import {
    ArrowRightIcon,
    BagIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CloseIcon,
    HeartIcon,
    InstagramGlyphIcon,
    MenuIcon,
    MinusIcon,
    PlusIcon,
    SearchIcon,
} from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { Placeholder } from '@/components/drio/placeholder';
import { Price } from '@/components/drio/price';
import { Rating } from '@/components/drio/rating';
import { SectionHeader } from '@/components/drio/section-header';
import { Wordmark } from '@/components/drio/wordmark';
import { home } from '@/routes';

/**
 * Phase 1 deliverable — every primitive, in every variant and state (§10).
 *
 * The controls here are live rather than screenshotted, so tabbing through the
 * page is itself the focus-ring check §11 asks for.
 */

function Section({
    title,
    children,
    onDark = false,
}: {
    title: string;
    children: ReactNode;
    onDark?: boolean;
}) {
    return (
        <section
            className={
                onDark
                    ? 'rounded-panel bg-forest px-6 py-8'
                    : 'border-t border-hairline pt-8'
            }
        >
            <h2
                className={`mb-6 font-display text-section font-medium ${
                    onDark ? 'text-cream' : 'text-ink'
                }`}
            >
                {title}
            </h2>
            {children}
        </section>
    );
}

function Specimen({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-2.5">
            <span className="drio-eyebrow text-ink-muted">{label}</span>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}

function IconTile({ label, children }: { label: string; children: ReactNode }) {
    return (
        <li className="flex flex-col items-center gap-2 rounded-card border border-hairline p-3">
            <span className="flex h-8 items-center text-ink">{children}</span>
            <code className="text-[0.6875rem] text-ink-muted">{label}</code>
        </li>
    );
}

export default function DesignSystemPage() {
    const { t } = useTranslation('design');
    const [wishlisted, setWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);

    return (
        <>
            <Head title={t('system.title')} />

            <div className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                <p className="drio-eyebrow text-gold-700">
                    {t('system.eyebrow')}
                </p>
                <h1 className="mt-3 font-display text-hero font-medium text-ink">
                    {t('system.title')}
                </h1>
                <p className="mt-4 max-w-2xl text-copy text-ink-muted">
                    {t('system.intro')}
                </p>

                <div className="mt-14 flex flex-col gap-12">
                    {/* ---------------------------------------------- Buttons */}
                    <Section title={t('system.sections.buttons')}>
                        <div className="flex flex-col gap-7">
                            <Specimen label={t('system.variants.primary')}>
                                <Button variant="primary">
                                    {t('system.states.default')}
                                </Button>
                                <Button variant="primary" withArrow>
                                    {t('system.variants.withArrow')}
                                </Button>
                                <Button variant="primary" disabled>
                                    {t('system.variants.disabled')}
                                </Button>
                            </Specimen>

                            <Specimen label={t('system.variants.outline')}>
                                <Button variant="outline">
                                    {t('system.states.default')}
                                </Button>
                                <Button variant="outline" withArrow>
                                    {t('system.variants.withArrow')}
                                </Button>
                                <Button variant="outline" disabled>
                                    {t('system.variants.disabled')}
                                </Button>
                            </Specimen>

                            <Specimen label={t('system.variants.ghost')}>
                                <Button variant="ghost">
                                    {t('system.states.default')}
                                </Button>
                                <Button variant="ghost" withArrow>
                                    {t('system.variants.withArrow')}
                                </Button>
                                <Button variant="ghost" disabled>
                                    {t('system.variants.disabled')}
                                </Button>
                            </Specimen>

                            <Specimen label={t('system.variants.sizes')}>
                                <Button size="sm">sm</Button>
                                <Button size="md">md</Button>
                                <Button size="lg">lg</Button>
                                <ButtonLink
                                    href={home()}
                                    variant="outline"
                                    size="md"
                                >
                                    ButtonLink
                                </ButtonLink>
                            </Specimen>
                        </div>
                    </Section>

                    <Section title={t('system.variants.onDark')} onDark>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="primary">
                                {t('system.variants.primary')}
                            </Button>
                            <Button variant="dark" withArrow>
                                {t('system.variants.dark')}
                            </Button>
                            <Button variant="dark" disabled>
                                {t('system.variants.disabled')}
                            </Button>
                            <Price amount={1580} tone="dark" />
                            <IconButton
                                variant="light"
                                label={t('system.sections.icons')}
                            >
                                <SearchIcon />
                            </IconButton>
                        </div>
                    </Section>

                    {/* --------------------------------------- Section header */}
                    <Section title={t('system.sections.sectionHeader')}>
                        <div className="flex flex-col gap-8">
                            <SectionHeader
                                title="Best Sellers"
                                viewAllHref={home()}
                                viewAllLabel="View all Products"
                            />
                            <SectionHeader
                                title="Follow Our Journey"
                                subtitle="@drio.srilankanflavours"
                                viewAllHref={home()}
                                viewAllLabel="View on Instagram"
                            />
                            <SectionHeader title="Customer Reviews" />
                        </div>
                    </Section>

                    {/* ---------------------------------------------- Media */}
                    <Section title={t('system.sections.media')}>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <Placeholder
                                ratio="1/1"
                                label="Product — Dehydrated Jackfruit 200g"
                            />
                            <Placeholder
                                ratio="4/3"
                                label="Category — Curry Powder"
                                rounded="card"
                            />
                            <Placeholder
                                ratio="16/9"
                                label="Recipe — Polos Curry"
                                rounded="card"
                            />
                            <Placeholder
                                ratio="3/4"
                                label="Story — Cooking scene"
                                rounded="panel"
                            />
                        </div>

                        <div className="mt-5">
                            <Placeholder
                                ratio="21/9"
                                label="Hero — spread of products on wood"
                                rounded="panel"
                            />
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <span className="drio-eyebrow text-ink-muted">
                                    Media — no record
                                </span>
                                <Media
                                    ratio="4/3"
                                    label="Product — Chilli Powder"
                                    rounded="card"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="drio-eyebrow text-ink-muted">
                                    Media — record present
                                </span>
                                {/*
                                 * An inline SVG data URI stands in for a real
                                 * upload, proving the img branch renders and
                                 * holds the same box — no fetched asset (§3).
                                 */}
                                <Media
                                    ratio="4/3"
                                    label="Product — Chilli Powder"
                                    rounded="card"
                                    media={{
                                        url:
                                            'data:image/svg+xml;utf8,' +
                                            encodeURIComponent(
                                                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#A5643C"/></svg>',
                                            ),
                                        alt: 'Clay-toned stand-in for an uploaded product photograph',
                                    }}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* --------------------------------------- Rating & price */}
                    <Section title={t('system.sections.rating')}>
                        <div className="flex flex-col gap-4">
                            <Rating value={5} count={96} />
                            <Rating value={4.5} count={128} />
                            <Rating value={4} count={84} />
                            <Rating value={3.5} count={12} />
                            <Rating value={0} count={0} />
                            <Rating value={4.5} size="md" />
                        </div>
                    </Section>

                    <Section title={t('system.sections.price')}>
                        <div className="flex flex-wrap items-baseline gap-8">
                            <Price amount={1580} size="sm" />
                            <Price amount={1580} size="md" />
                            <Price amount={1580} size="lg" />
                            <Price amount={880} compareAtAmount={1180} />
                        </div>
                    </Section>

                    {/* ---------------------------------------------- Badges */}
                    <Section title={t('system.sections.badges')}>
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="sale">Sale</Badge>
                            <Badge variant="gold">Best Seller</Badge>
                            <Badge variant="sand">Vegetarian</Badge>
                            <Badge variant="outline">200g</Badge>
                            <Badge variant="forest">New</Badge>
                            <Badge variant="clay">Traditional</Badge>
                        </div>
                    </Section>

                    {/* ----------------------------------------- Icon buttons */}
                    <Section title={t('system.sections.iconButtons')}>
                        <div className="flex flex-wrap items-center gap-5">
                            <IconButton label="Search" variant="plain">
                                <SearchIcon />
                            </IconButton>

                            <IconButton
                                label="Wishlist"
                                variant="plain"
                                badge={
                                    <CountBadge
                                        count={2}
                                        label="2 items in wishlist"
                                    />
                                }
                            >
                                <HeartIcon />
                            </IconButton>

                            <IconButton
                                label="Cart"
                                variant="plain"
                                badge={
                                    <CountBadge
                                        count={128}
                                        label="128 items in cart"
                                    />
                                }
                            >
                                <BagIcon />
                            </IconButton>

                            <IconButton
                                label={
                                    wishlisted
                                        ? 'Remove from wishlist'
                                        : 'Add to wishlist'
                                }
                                variant="surface"
                                aria-pressed={wishlisted}
                                onClick={() => setWishlisted((value) => !value)}
                                className={
                                    wishlisted ? 'text-chilli' : undefined
                                }
                            >
                                <HeartIcon filled={wishlisted} />
                            </IconButton>

                            <IconButton label="Previous" variant="outline">
                                <ChevronLeftIcon />
                            </IconButton>
                            <IconButton label="Next" variant="outline">
                                <ChevronRightIcon />
                            </IconButton>
                            <IconButton label="Next" variant="outline" disabled>
                                <ChevronRightIcon />
                            </IconButton>

                            <span className="flex items-center gap-1 rounded-btn border border-hairline">
                                <IconButton
                                    label="Decrease quantity"
                                    size="sm"
                                    onClick={() =>
                                        setQuantity((value) =>
                                            Math.max(1, value - 1),
                                        )
                                    }
                                >
                                    <MinusIcon />
                                </IconButton>
                                <span
                                    className="w-8 text-center text-copy"
                                    aria-live="polite"
                                >
                                    {quantity}
                                </span>
                                <IconButton
                                    label="Increase quantity"
                                    size="sm"
                                    onClick={() =>
                                        setQuantity((value) => value + 1)
                                    }
                                >
                                    <PlusIcon />
                                </IconButton>
                            </span>
                        </div>
                    </Section>

                    {/* ----------------------------------------------- Forms */}
                    <Section title={t('system.sections.forms')}>
                        <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
                            <Input
                                label={t('system.forms.inputLabel')}
                                type="email"
                                placeholder={t('system.forms.inputPlaceholder')}
                                hint={t('system.forms.inputHint')}
                            />
                            <Input
                                label={t('system.forms.inputLabel')}
                                type="email"
                                defaultValue="not-an-email"
                                error={t('system.forms.inputError')}
                            />
                            <Input
                                label={t('system.forms.inputLabel')}
                                defaultValue="niroshi@example.jp"
                                disabled
                            />
                            <Select
                                label={t('system.forms.selectLabel')}
                                placeholder={t(
                                    'system.forms.selectPlaceholder',
                                )}
                                defaultValue=""
                                options={[
                                    { value: 'tokyo', label: 'Tokyo' },
                                    { value: 'osaka', label: 'Osaka' },
                                    { value: 'kanagawa', label: 'Kanagawa' },
                                    { value: 'aichi', label: 'Aichi' },
                                ]}
                            />
                            <Textarea
                                label={t('system.forms.textareaLabel')}
                                placeholder={t(
                                    'system.forms.textareaPlaceholder',
                                )}
                                className="sm:col-span-2"
                            />
                        </div>
                    </Section>

                    {/* ------------------------------------------- Icon set */}
                    <Section title={t('system.sections.icons')}>
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-3">
                                <span className="drio-eyebrow text-ink-muted">
                                    Interface
                                </span>
                                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                                    <IconTile label="search">
                                        <SearchIcon />
                                    </IconTile>
                                    <IconTile label="heart">
                                        <HeartIcon />
                                    </IconTile>
                                    <IconTile label="heart filled">
                                        <HeartIcon filled />
                                    </IconTile>
                                    <IconTile label="bag">
                                        <BagIcon />
                                    </IconTile>
                                    <IconTile label="menu">
                                        <MenuIcon />
                                    </IconTile>
                                    <IconTile label="close">
                                        <CloseIcon />
                                    </IconTile>
                                    <IconTile label="arrow">
                                        <ArrowRightIcon />
                                    </IconTile>
                                    <IconTile label="chevron L">
                                        <ChevronLeftIcon />
                                    </IconTile>
                                    <IconTile label="chevron R">
                                        <ChevronRightIcon />
                                    </IconTile>
                                    <IconTile label="plus">
                                        <PlusIcon />
                                    </IconTile>
                                    <IconTile label="minus">
                                        <MinusIcon />
                                    </IconTile>
                                    <IconTile label="check">
                                        <CheckIcon />
                                    </IconTile>
                                    <IconTile label="instagram">
                                        <InstagramGlyphIcon />
                                    </IconTile>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="drio-eyebrow text-ink-muted">
                                    Category — icon_key
                                </span>
                                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                                    {CATEGORY_ICON_KEYS.map((key) => (
                                        <IconTile key={key} label={key}>
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-white">
                                                <CategoryIcon iconKey={key} />
                                            </span>
                                        </IconTile>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="drio-eyebrow text-ink-muted">
                                    Why Choose DRIO
                                </span>
                                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                    {FEATURE_ICON_KEYS.map((key) => (
                                        <IconTile key={key} label={key}>
                                            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink">
                                                <FeatureIcon iconKey={key} />
                                            </span>
                                        </IconTile>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="drio-eyebrow text-ink-muted">
                                    Social
                                </span>
                                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                                    <IconTile label="instagram">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-cream">
                                            <InstagramIcon />
                                        </span>
                                    </IconTile>
                                    <IconTile label="facebook">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-cream">
                                            <FacebookIcon />
                                        </span>
                                    </IconTile>
                                    <IconTile label="youtube">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-cream">
                                            <YouTubeIcon />
                                        </span>
                                    </IconTile>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="drio-eyebrow text-ink-muted">
                                    We Accept
                                </span>
                                <ul className="flex flex-wrap gap-3">
                                    {PAYMENT_METHODS.map((method) => (
                                        <li
                                            key={method}
                                            className="rounded-card border border-hairline p-2"
                                        >
                                            <PaymentMark
                                                method={method}
                                                title={method}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* ------------------------------------ Botanical motif */}
                    <Section title={t('system.sections.motif')}>
                        <div className="flex flex-col gap-8">
                            <Specimen label="Wordmark">
                                <Wordmark />
                            </Specimen>

                            <Specimen label="BotanicalRule — section header">
                                <BotanicalRule className="text-gold" />
                                <BotanicalRule
                                    className="text-gold"
                                    length={56}
                                />
                            </Specimen>

                            <Specimen label="BotanicalFlourish — Why Choose DRIO">
                                <BotanicalFlourish className="text-gold" />
                                <BotanicalFlourish className="-scale-x-100 text-gold" />
                            </Specimen>

                            <Specimen label="BotanicalDivider — under the logo">
                                <BotanicalDivider className="text-gold" />
                            </Specimen>

                            <Specimen label="PalmFlourish — Our Story panel">
                                <PalmFlourish className="text-gold" />
                            </Specimen>

                            <div className="flex flex-col gap-2.5">
                                <span className="drio-eyebrow text-ink-muted">
                                    Newsletter band anchors
                                </span>
                                <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-panel bg-sand">
                                    <NewsletterSprig className="absolute -bottom-4 left-0 h-40 text-forest-500" />
                                    <NewsletterCoconut className="absolute right-0 -bottom-6 h-44 text-clay" />
                                    <span className="relative font-display text-section font-medium text-ink">
                                        Stay Connected With DRIO
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </>
    );
}
