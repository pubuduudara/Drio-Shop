import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

/**
 * The confirmation every destructive admin action goes through (§8).
 *
 * The title names what will be deleted rather than asking "Are you sure?" —
 * the whole value of the dialog is that the operator reads the name back
 * before the row disappears.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    name,
    description,
    confirmLabel,
    onConfirm,
    processing = false,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** What is about to be deleted, e.g. a product name. */
    name: string;
    description?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    processing?: boolean;
    /** Extra context, e.g. how many products a category holds. */
    children?: ReactNode;
}) {
    const { t } = useTranslation('admin');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('confirm.title', { name })}</DialogTitle>
                    <DialogDescription>
                        {description ?? t('confirm.body')}
                    </DialogDescription>
                </DialogHeader>

                {children}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('confirm.cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={processing}
                        onClick={onConfirm}
                    >
                        {confirmLabel ?? t('confirm.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
