import type {
    HTMLAttributes,
    ReactNode,
    TdHTMLAttributes,
    ThHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * The admin table (§8).
 *
 * Compact, dense, functional: 13px Inter, tight rows, hairline rules and no
 * ornament. Deliberately not the storefront's card language — this is a work
 * tool and it should read like a spreadsheet, not a catalogue (§12).
 *
 * Built here rather than pulled from shadcn because the row density, the
 * sticky header and the inline-edit cells are the whole point of it.
 */

export function TableShell({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'overflow-x-auto rounded-md border border-neutral-200',
                className,
            )}
        >
            <table className="w-full border-collapse text-left text-[13px]">
                {children}
            </table>
        </div>
    );
}

export function Th({
    children,
    className,
    ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            scope="col"
            className={cn(
                'border-b border-neutral-200 bg-neutral-50 px-3 py-2',
                'text-[11px] font-semibold tracking-[0.08em] text-neutral-500 uppercase',
                className,
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export function Td({
    children,
    className,
    ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td
            className={cn(
                'border-b border-neutral-100 px-3 py-1.5 align-middle',
                className,
            )}
            {...props}
        >
            {children}
        </td>
    );
}

export function Tr({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn('transition-colors hover:bg-neutral-50', className)}
            {...props}
        >
            {children}
        </tr>
    );
}

/**
 * The row a table shows instead of data. Says what to do next rather than
 * only reporting that there is nothing (§8).
 */
export function EmptyRow({
    colSpan,
    children,
}: {
    colSpan: number;
    children: ReactNode;
}) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="px-3 py-10 text-center text-neutral-500"
            >
                {children}
            </td>
        </tr>
    );
}
