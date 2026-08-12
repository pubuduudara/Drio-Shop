import { useTranslation } from 'react-i18next';
import { InstagramGlyphIcon } from '@/components/drio/icons/ui';
import { Placeholder } from '@/components/drio/placeholder';
import { SectionHeader } from '@/components/drio/section-header';
import { home } from '@/routes';

/**
 * Follow Our Journey (§7.9).
 *
 * The header sits in the container, but the tile strip is edge-to-edge with no
 * gaps — hence the full-bleed wrapper outside the container rather than a
 * negative margin inside it.
 */
export function FollowOurJourney({ tileCount }: { tileCount: number }) {
    const { t } = useTranslation(['home', 'common']);

    return (
        <section className="py-16 md:py-20">
            <div className="mx-auto max-w-drio px-5 md:px-8 lg:px-10">
                <SectionHeader
                    title={t('home:instagram.title')}
                    subtitle={t('home:instagram.handle')}
                    viewAllHref={home()}
                    viewAllLabel={t('common:actions.viewOnInstagram')}
                />
            </div>

            <ul className="mt-8 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7">
                {Array.from({ length: tileCount }, (_, index) => (
                    <li key={index} className="group/tile relative">
                        <a
                            href="https://instagram.com/drio.srilankanflavours"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="block"
                            aria-label={t('common:actions.viewOnInstagram')}
                        >
                            <Placeholder
                                ratio="1/1"
                                label={`Instagram — post ${index + 1}`}
                            />

                            <span
                                className="absolute inset-0 flex items-center justify-center bg-forest/60 opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100"
                                aria-hidden
                            >
                                <InstagramGlyphIcon className="text-cream" />
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}
