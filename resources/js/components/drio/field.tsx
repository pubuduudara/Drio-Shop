import { useId } from 'react';
import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';
import { ChevronRightIcon } from './icons/ui';

/**
 * Storefront form controls (§5.4): white surface, hairline border, 4px radius,
 * gold focus ring.
 *
 * Each control wires its own label, hint and error through `aria-describedby`
 * and `aria-invalid`, so a field is accessible by construction rather than by
 * remembering to do it at every call site (§11).
 */

type FieldShellProps = {
    label: string;
    /** Visually hides the label while leaving it available to assistive tech. */
    hideLabel?: boolean;
    hint?: string;
    /** A server-side validation message. Its presence sets `aria-invalid`. */
    error?: string;
    required?: boolean;
    className?: string;
    children: (ids: {
        id: string;
        describedBy: string | undefined;
        invalid: boolean;
    }) => ReactNode;
};

function FieldShell({
    label,
    hideLabel,
    hint,
    error,
    required,
    className,
    children,
}: FieldShellProps) {
    const id = useId();
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy =
        [errorId, hintId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label
                htmlFor={id}
                className={cn(
                    'text-small font-medium text-ink',
                    hideLabel && 'sr-only',
                )}
            >
                {label}
                {required && (
                    <span className="ml-0.5 text-chilli" aria-hidden>
                        *
                    </span>
                )}
            </label>

            {children({ id, describedBy, invalid: Boolean(error) })}

            {error && (
                <p id={errorId} className="text-small text-chilli">
                    {error}
                </p>
            )}
            {hint && !error && (
                <p id={hintId} className="text-small text-ink-muted">
                    {hint}
                </p>
            )}
        </div>
    );
}

const controlClasses = [
    'w-full rounded-btn border bg-paper px-3.5',
    'font-body text-copy text-ink placeholder:text-ink-muted',
    'transition-colors duration-200',
    'disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink-muted',
    'aria-[invalid=true]:border-chilli',
] as const;

export type InputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'className'
> &
    Omit<FieldShellProps, 'children'>;

export function Input({
    label,
    hideLabel,
    hint,
    error,
    required,
    className,
    ...props
}: InputProps) {
    return (
        <FieldShell
            label={label}
            hideLabel={hideLabel}
            hint={hint}
            error={error}
            required={required}
            className={className}
        >
            {({ id, describedBy, invalid }) => (
                <input
                    id={id}
                    required={required}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    className={cn(
                        controlClasses,
                        'h-11 border-line focus:border-gold',
                    )}
                    {...props}
                />
            )}
        </FieldShell>
    );
}

export type SelectProps = Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'id' | 'className'
> &
    Omit<FieldShellProps, 'children'> & {
        /** Renders a disabled first option so the empty state reads as a prompt. */
        placeholder?: string;
        options: { value: string; label: string }[];
    };

export function Select({
    label,
    hideLabel,
    hint,
    error,
    required,
    className,
    placeholder,
    options,
    ...props
}: SelectProps) {
    return (
        <FieldShell
            label={label}
            hideLabel={hideLabel}
            hint={hint}
            error={error}
            required={required}
            className={className}
        >
            {({ id, describedBy, invalid }) => (
                <div className="relative">
                    <select
                        id={id}
                        required={required}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={cn(
                            controlClasses,
                            'h-11 appearance-none border-line pr-10 focus:border-gold',
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronRightIcon
                        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 rotate-90 text-ink-muted"
                        aria-hidden
                    />
                </div>
            )}
        </FieldShell>
    );
}

export type TextareaProps = Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'id' | 'className'
> &
    Omit<FieldShellProps, 'children'>;

export function Textarea({
    label,
    hideLabel,
    hint,
    error,
    required,
    className,
    rows = 4,
    ...props
}: TextareaProps) {
    return (
        <FieldShell
            label={label}
            hideLabel={hideLabel}
            hint={hint}
            error={error}
            required={required}
            className={className}
        >
            {({ id, describedBy, invalid }) => (
                <textarea
                    id={id}
                    rows={rows}
                    required={required}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    className={cn(
                        controlClasses,
                        'resize-y border-line py-2.5 focus:border-gold',
                    )}
                    {...props}
                />
            )}
        </FieldShell>
    );
}
