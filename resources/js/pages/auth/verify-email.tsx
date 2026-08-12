import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        title: t('auth.verifyTitle'),
        description: t('auth.verifyDescription'),
    });

    return (
        <>
            <Head title={t('auth.verifyTitle')} />

            {status === 'verification-link-sent' && (
                <div
                    role="status"
                    className="mb-4 text-center text-sm font-medium text-green-600"
                >
                    {t('auth.verifySent')}
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            {t('auth.verifyResend')}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            {t('auth.signOut')}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}
