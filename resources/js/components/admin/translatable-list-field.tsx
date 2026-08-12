import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { TranslatedList } from '@/types/admin';

/**
 * The repeatable builder behind a recipe's ingredients and method (§8).
 *
 * `<TranslatableField />`'s sibling for translatable *lists* — the stored JSON
 * is keyed by locale and each value is an array of strings. It follows the same
 * §9.5 rule: one locale enabled renders a plain list of rows, two or more grow
 * locale tabs, and the call site does not change.
 *
 * Rows can be reordered with buttons rather than only by drag, because method
 * steps are ordered content and the console has to be usable from a keyboard
 * (§11).
 */
export function TranslatableListField({
    label,
    name,
    value,
    onChange,
    errors,
    addLabel,
    placeholder,
    numbered = false,
    required = false,
}: {
    label: string;
    /** The attribute name, used to look the right error up. */
    name: string;
    value: TranslatedList;
    onChange: (value: TranslatedList) => void;
    errors?: Record<string, string | undefined>;
    addLabel: string;
    placeholder?: string;
    /** Numbers each row — the method is ordered, the ingredients are not. */
    numbered?: boolean;
    required?: boolean;
}) {
    const { t } = useTranslation('admin');
    const { enabledLocales, defaultLocale, localeMeta, isSingleLocale } =
        useLocale();

    const [activeLocale, setActiveLocale] = useState(defaultLocale);
    const locale = isSingleLocale ? defaultLocale : activeLocale;

    // At least one row, always: an empty builder offers nothing to type into.
    const rows = value[locale]?.length ? value[locale] : [''];
    const error = errors?.[`${name}.${locale}`] ?? errors?.[name];

    const write = (next: string[]): void =>
        onChange({ ...value, [locale]: next });

    const setRow = (index: number, entry: string): void =>
        write(rows.map((row, position) => (position === index ? entry : row)));

    const addRow = (): void => write([...rows, '']);

    const removeRow = (index: number): void =>
        write(rows.length === 1 ? [''] : rows.filter((_, i) => i !== index));

    const move = (from: number, to: number): void => {
        if (to < 0 || to >= rows.length) {
            return;
        }

        const next = [...rows];
        const [row] = next.splice(from, 1);
        next.splice(to, 0, row);
        write(next);
    };

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between gap-3">
                <Label className="text-[13px]">
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
                        {enabledLocales.map((code) => (
                            <button
                                key={code}
                                type="button"
                                role="tab"
                                aria-selected={code === locale}
                                onClick={() => setActiveLocale(code)}
                                className={cn(
                                    'flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                                    code === locale
                                        ? 'bg-neutral-900 text-white'
                                        : 'text-neutral-500 hover:bg-neutral-100',
                                )}
                            >
                                {localeMeta[code]?.label ?? code.toUpperCase()}
                                {(value[code]?.length ?? 0) === 0 && (
                                    <span
                                        className="size-1.5 rounded-full bg-amber-500"
                                        aria-label={t(
                                            'translatable.untranslated',
                                        )}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <ol className="flex flex-col gap-1.5">
                {rows.map((row, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                        {numbered && (
                            <span className="w-6 shrink-0 text-right text-[11px] text-neutral-500 tabular-nums">
                                {index + 1}.
                            </span>
                        )}

                        <Input
                            value={row}
                            placeholder={placeholder}
                            aria-label={`${label} ${index + 1}`}
                            onChange={(event) =>
                                setRow(index, event.target.value)
                            }
                            className="h-8 text-[13px]"
                        />

                        <RowButton
                            label={t('list.moveUp')}
                            disabled={index === 0}
                            onClick={() => move(index, index - 1)}
                        >
                            ↑
                        </RowButton>
                        <RowButton
                            label={t('list.moveDown')}
                            disabled={index === rows.length - 1}
                            onClick={() => move(index, index + 1)}
                        >
                            ↓
                        </RowButton>
                        <RowButton
                            label={t('list.remove')}
                            onClick={() => removeRow(index)}
                        >
                            ✕
                        </RowButton>
                    </li>
                ))}
            </ol>

            <div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addRow}
                >
                    {addLabel}
                </Button>
            </div>

            <InputError message={error} />
        </div>
    );
}

function RowButton({
    label,
    onClick,
    disabled,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    children: string;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className="shrink-0 rounded px-1.5 py-1 text-[12px] text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-25"
        >
            {children}
        </button>
    );
}
