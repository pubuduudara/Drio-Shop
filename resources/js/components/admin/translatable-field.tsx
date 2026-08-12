import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { Translations } from '@/types/admin';

/**
 * The one admin control for a translatable attribute (§9.5).
 *
 * With a single locale enabled it renders as an ordinary labelled field: no
 * tabs, no locale badges, no visual overhead — the console looks
 * single-language because it effectively is.
 *
 * With two or more it grows locale tabs, a dot on tabs whose value is empty,
 * and the fallback value as greyed placeholder text so the editor can see what
 * they are translating. Nothing about the call site changes; every translatable
 * field in every admin form uses this from day one, which is what makes the
 * second locale a config change rather than a form-by-form retrofit.
 */

type TranslatableFieldProps = {
    label: string;
    /** `{locale: value}`, one key per enabled locale. */
    value: Translations;
    onChange: (value: Translations) => void;
    /** Laravel's errors, keyed `field.locale` — e.g. `name.en`. */
    errors?: Record<string, string | undefined>;
    /** The attribute name, used to look the right error up. */
    name: string;
    as?: 'input' | 'textarea';
    rows?: number;
    placeholder?: string;
    hint?: string;
    required?: boolean;
    className?: string;
};

export function TranslatableField({
    label,
    value,
    onChange,
    errors,
    name,
    as = 'input',
    rows = 4,
    placeholder,
    hint,
    required = false,
    className,
}: TranslatableFieldProps) {
    const { t } = useTranslation('admin');
    const { enabledLocales, defaultLocale, localeMeta, isSingleLocale } =
        useLocale();

    const [activeLocale, setActiveLocale] = useState(defaultLocale);
    const locale = isSingleLocale ? defaultLocale : activeLocale;

    const fieldId = `${name}-${locale}`;
    const error = errors?.[`${name}.${locale}`] ?? errors?.[name];
    const fallback = value[defaultLocale] ?? '';

    const controlProps = {
        id: fieldId,
        value: value[locale] ?? '',
        required: required && locale === defaultLocale,
        'aria-invalid': Boolean(error),
        // In an untranslated tab the default-locale value shows through as
        // placeholder text — the editor sees the source, not a blank box.
        placeholder:
            locale === defaultLocale ? placeholder : fallback || placeholder,
        onChange: (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => onChange({ ...value, [locale]: event.target.value }),
    };

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <div className="flex items-end justify-between gap-3">
                <Label htmlFor={fieldId} className="text-[13px]">
                    {label}
                    {required && (
                        <span className="text-destructive" aria-hidden>
                            *
                        </span>
                    )}
                </Label>

                {!isSingleLocale && (
                    <div
                        role="tablist"
                        aria-label={t('translatable.locales')}
                        className="flex items-center gap-0.5"
                    >
                        {enabledLocales.map((code) => {
                            const isActive = code === locale;
                            const isEmpty = !value[code];

                            return (
                                <button
                                    key={code}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveLocale(code)}
                                    className={cn(
                                        'flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                                        isActive
                                            ? 'bg-neutral-900 text-white'
                                            : 'text-neutral-500 hover:bg-neutral-100',
                                    )}
                                >
                                    {localeMeta[code]?.label ??
                                        code.toUpperCase()}
                                    {isEmpty && (
                                        <span
                                            className="size-1.5 rounded-full bg-amber-500"
                                            aria-label={t(
                                                'translatable.untranslated',
                                            )}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {as === 'textarea' ? (
                <textarea
                    {...controlProps}
                    rows={rows}
                    className="min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-[13px] shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                />
            ) : (
                <Input {...controlProps} className="h-8 text-[13px]" />
            )}

            {!isSingleLocale && locale !== defaultLocale && fallback && (
                <p className="text-[11px] text-neutral-500">
                    {t('translatable.fallbackHint', {
                        locale:
                            localeMeta[defaultLocale]?.label ?? defaultLocale,
                    })}
                </p>
            )}

            {hint && !error && (
                <p className="text-[11px] text-neutral-500">{hint}</p>
            )}

            <InputError message={error} />
        </div>
    );
}
