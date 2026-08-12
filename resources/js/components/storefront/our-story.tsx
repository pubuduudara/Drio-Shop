import { useTranslation } from 'react-i18next';
import { ButtonLink } from '@/components/drio/button';
import { PalmFlourish } from '@/components/drio/icons/botanical';
import { Media } from '@/components/drio/media';
import { about } from '@/routes';

/**
 * Our Story (§7.6).
 *
 * An asymmetric three-panel row at roughly 1fr / 1.6fr / 0.9fr, equal height.
 * On mobile it stacks with the text panel first, which is why the text panel
 * is written first in the DOM rather than reordered with CSS.
 */
export function OurStory() {
    const { t } = useTranslation(['home', 'common']);

    return (
        <section className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
            <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[1fr_1.6fr_0.9fr] lg:items-stretch">
                <div className="flex flex-col justify-center rounded-card bg-sand p-7 lg:p-8">
                    <span className="drio-eyebrow text-gold-700">
                        {t('home:story.eyebrow')}
                    </span>

                    <h2 className="mt-3 font-display text-section font-medium text-ink">
                        {t('home:story.title')}
                    </h2>

                    <p className="mt-5 text-small leading-relaxed text-ink-muted">
                        {t('home:story.paragraph1')}
                    </p>
                    <p className="mt-3 text-small leading-relaxed text-ink-muted">
                        {t('home:story.paragraph2')}
                    </p>

                    <ButtonLink
                        href={about()}
                        variant="primary"
                        size="sm"
                        className="mt-6 self-start"
                    >
                        {t('common:actions.learnOurStory')}
                    </ButtonLink>
                </div>

                <div className="overflow-hidden rounded-card">
                    <Media
                        media={null}
                        ratio="4/3"
                        label="Story — cooking over an open fire"
                        className="h-full"
                        imageClassName="h-full object-cover"
                    />
                </div>

                <div className="relative overflow-hidden rounded-card">
                    <Media
                        media={null}
                        ratio="3/4"
                        label="Story — palms at dusk"
                        className="h-full"
                        imageClassName="h-full object-cover"
                        // The serif caption is overlaid dead centre here.
                        captionPlacement="top"
                    />

                    {/* A light scrim so the overlaid serif stays readable over
                        whatever photograph lands here. */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to bottom, color-mix(in srgb, var(--drio-cream) 55%, transparent), color-mix(in srgb, var(--drio-cream) 25%, transparent))',
                        }}
                        aria-hidden
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                        <PalmFlourish className="text-gold" />
                        <p className="font-display text-2xl leading-tight font-medium text-ink">
                            {t('home:story.panelCaption')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
