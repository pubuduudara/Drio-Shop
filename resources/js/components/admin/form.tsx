import { useId } from 'react';
import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
} from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Admin form furniture (§8): dense, 13px, Inter, no display serif.
 *
 * Every control renders its Laravel validation message underneath and sets
 * `aria-invalid` from the same value, so field-level errors are structural
 * rather than something each form has to remember (§8, §11).
 */

export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-md border border-neutral-200 p-4">
            <h2 className="text-[13px] font-semibold text-neutral-900">
                {title}
            </h2>
            {description && (
                <p className="mt-0.5 text-[12px] text-neutral-500">
                    {description}
                </p>
            )}
            <div className="mt-3 grid gap-3">{children}</div>
        </section>
    );
}

/** The tab strip across a create/edit form (§8). */
export function FormTabs<T extends string>({
    tabs,
    active,
    onChange,
    invalid = [],
}: {
    tabs: { key: T; label: string }[];
    active: T;
    onChange: (key: T) => void;
    /** Tabs holding a validation error, marked so nothing fails out of sight. */
    invalid?: T[];
}) {
    return (
        <div
            role="tablist"
            className="flex flex-wrap items-center gap-1 border-b border-neutral-200"
        >
            {tabs.map((tab) => {
                const isActive = tab.key === active;
                const hasError = invalid.includes(tab.key);

                return (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'relative -mb-px flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[13px] transition-colors',
                            isActive
                                ? 'border-neutral-900 font-medium text-neutral-900'
                                : 'border-transparent text-neutral-500 hover:text-neutral-800',
                        )}
                    >
                        {tab.label}
                        {hasError && (
                            <span className="size-1.5 rounded-full bg-destructive" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

type FieldProps = {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
};

export type AdminInputProps = FieldProps &
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>;

export function AdminInput({
    label,
    error,
    hint,
    required,
    className,
    ...props
}: AdminInputProps) {
    const id = useId();

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <Label htmlFor={id} className="text-[13px]">
                {label}
                {required && (
                    <span className="text-destructive" aria-hidden>
                        *
                    </span>
                )}
            </Label>
            <Input
                id={id}
                required={required}
                aria-invalid={Boolean(error)}
                className="h-8 text-[13px]"
                {...props}
            />
            {hint && !error && (
                <p className="text-[11px] text-neutral-500">{hint}</p>
            )}
            <InputError message={error} />
        </div>
    );
}

export type AdminSelectProps = FieldProps &
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> & {
        options: { value: string; label: string }[];
        placeholder?: string;
    };

export function AdminSelect({
    label,
    error,
    hint,
    required,
    className,
    options,
    placeholder,
    ...props
}: AdminSelectProps) {
    const id = useId();

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <Label htmlFor={id} className="text-[13px]">
                {label}
                {required && (
                    <span className="text-destructive" aria-hidden>
                        *
                    </span>
                )}
            </Label>
            <select
                id={id}
                required={required}
                aria-invalid={Boolean(error)}
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-[13px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {hint && !error && (
                <p className="text-[11px] text-neutral-500">{hint}</p>
            )}
            <InputError message={error} />
        </div>
    );
}

/** A labelled checkbox row, used for the form's Flags tab. */
export function AdminToggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    const id = useId();

    return (
        <div className="flex items-start gap-2.5">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 size-3.5 rounded border-neutral-300 accent-neutral-900"
            />
            <div className="grid gap-0.5">
                <Label htmlFor={id} className="text-[13px] font-normal">
                    {label}
                </Label>
                {description && (
                    <p className="text-[11px] text-neutral-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
