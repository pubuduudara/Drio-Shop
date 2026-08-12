import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS, PaymentMark } from '@/components/drio/icons/payment';
import {
    FacebookIcon,
    InstagramIcon,
    YouTubeIcon,
} from '@/components/drio/icons/social';
import { Wordmark } from '@/components/drio/wordmark';
import { about, contact, home, shop } from '@/routes';
import { show as categoryShow } from '@/routes/categories';
import { index as recipesIndex } from '@/routes/recipes';

/**
 * The footer (§7.11).
 *
 * Column headers in gold utility caps, links in `cream/75` with a gold hover,
 * a `forest-500` hairline above the copyright line.
 *
 * Every link points at a real destination. The handful with no page yet —
 * Gift Sets, Blog, FAQ and the policy pages — fall back to the closest thing
 * that exists rather than to a route that would 404; they get their own pages
 * when the client supplies the copy.
 */

type FooterLink = {
    key: string;
    href: string;
};

type FooterColumn = {
    key: string;
    links: FooterLink[];
};

const COLUMNS: FooterColumn[] = [
    {
        key: 'shop',
        links: [
            { key: 'allProducts', href: shop().url },
            {
                key: 'dehydratedVegetables',
                href: categoryShow('dehydrated-vegetables').url,
            },
            // Two categories rather than one, so this lands on the shop with
            // the category filter in reach rather than on half of what it says.
            { key: 'spicesAndPowders', href: shop().url },
            {
                key: 'traditionalIngredients',
                href: categoryShow('traditional-ingredients').url,
            },
            { key: 'giftSets', href: shop().url },
        ],
    },
    {
        key: 'recipes',
        links: [
            { key: 'allRecipes', href: recipesIndex().url },
            {
                key: 'vegetarian',
                href: recipesIndex({ query: { diet: 'vegetarian' } }).url,
            },
            {
                key: 'nonVegetarian',
                href: recipesIndex({ query: { diet: 'non-vegetarian' } }).url,
            },
            {
                key: 'quickRecipes',
                href: recipesIndex({ query: { diet: 'quick' } }).url,
            },
            {
                key: 'traditionalRecipes',
                href: recipesIndex({ query: { diet: 'traditional' } }).url,
            },
        ],
    },
    {
        key: 'information',
        links: [
            { key: 'aboutUs', href: about().url },
            { key: 'ourStory', href: about().url },
            { key: 'blog', href: home().url },
            { key: 'faq', href: contact().url },
            { key: 'contactUs', href: contact().url },
        ],
    },
    {
        key: 'customerCare',
        links: [
            { key: 'shippingInformation', href: contact().url },
            { key: 'returnsAndExchanges', href: contact().url },
            { key: 'paymentMethods', href: contact().url },
            { key: 'termsAndConditions', href: home().url },
            { key: 'privacyPolicy', href: home().url },
        ],
    },
];

const SOCIAL_LINKS = [
    {
        key: 'instagram',
        Icon: InstagramIcon,
        href: 'https://instagram.com/drio.srilankanflavours',
    },
    {
        key: 'facebook',
        Icon: FacebookIcon,
        href: 'https://facebook.com/drio.srilankanflavours',
    },
    {
        key: 'youtube',
        Icon: YouTubeIcon,
        href: 'https://youtube.com/@drio.srilankanflavours',
    },
] as const;

export function SiteFooter() {
    const { t } = useTranslation(['footer', 'common']);

    return (
        <footer className="bg-forest text-cream">
            <div className="mx-auto max-w-drio px-5 py-14 md:px-8 md:py-16 lg:px-10">
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <Wordmark tone="light" />

                        <p className="mt-4 max-w-xs text-small leading-relaxed text-cream/70">
                            {t('common:brand.description')}
                        </p>

                        <ul className="mt-5 flex items-center gap-2.5">
                            {SOCIAL_LINKS.map(({ key, Icon, href }) => (
                                <li key={key}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        aria-label={t(`footer:social.${key}`)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 text-cream/80 transition-colors hover:bg-gold hover:text-white"
                                    >
                                        <Icon />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {COLUMNS.map((column) => (
                        <nav
                            key={column.key}
                            aria-label={t(`footer:columns.${column.key}.title`)}
                        >
                            <h2 className="drio-eyebrow text-gold">
                                {t(`footer:columns.${column.key}.title`)}
                            </h2>

                            <ul className="mt-4 flex flex-col gap-2.5">
                                {column.links.map((link) => (
                                    <li key={link.key}>
                                        <Link
                                            href={link.href}
                                            className="text-small text-cream/75 transition-colors hover:text-gold"
                                        >
                                            {t(
                                                `footer:columns.${column.key}.${link.key}`,
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}

                    <div className="col-span-2 md:col-span-1">
                        <h2 className="drio-eyebrow text-gold">
                            {t('footer:payments.title')}
                        </h2>

                        <ul className="mt-4 flex flex-wrap gap-2">
                            {PAYMENT_METHODS.map((method) => (
                                <li key={method}>
                                    <PaymentMark
                                        method={method}
                                        title={method}
                                        width={34}
                                        height={22}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-forest-500 pt-6">
                    <p className="text-small text-cream/60">
                        {t('footer:copyright', {
                            year: new Date().getFullYear(),
                        })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
