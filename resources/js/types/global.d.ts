import type { Auth } from '@/types/auth';
import type { Cart } from '@/types/cart';
import type { LocaleCode, LocaleMeta } from '@/types/locale';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            /**
             * Shared by SetLocale on storefront routes (§9.2). Optional
             * because the admin console and auth pages are not localised by
             * URL and so never pass through that middleware.
             */
            locale?: LocaleCode;
            defaultLocale?: LocaleCode;
            enabledLocales?: LocaleCode[];
            localeMeta?: Record<LocaleCode, LocaleMeta>;
            /**
             * Shared on every storefront page (§6): the header's bag badge is
             * on all of them and the drawer can open anywhere. Optional
             * because the admin console renders neither and is not given one.
             */
            cart?: Cart;
            [key: string]: unknown;
        };
    }
}
