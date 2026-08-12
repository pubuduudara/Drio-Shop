import type { ReactNode } from 'react';

/**
 * The heading row every admin list and form opens with: the page's `h1`, an
 * optional line of context, and the primary action on the right (§8, §11).
 */
export function PageHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-base font-semibold text-neutral-900">
                    {title}
                </h1>
                {description && (
                    <p className="mt-0.5 text-neutral-500">{description}</p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-2">{actions}</div>
            )}
        </div>
    );
}
