import { iconAccessibilityProps } from './icon';
import type { IconProps } from './icon';

/**
 * The `We Accept` marks in the footer (§7.11).
 *
 * Drawn rather than fetched, per §3, so they carry no external requests. Each
 * sits on a white 38×24 card with a 3px radius, matching the reference.
 */

export const PAYMENT_METHODS = [
    'visa',
    'mastercard',
    'jcb',
    'amex',
    'paypal',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function Card({
    title,
    children,
    ...props
}: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 38 24"
            width="38"
            height="24"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <rect width="38" height="24" rx="3" fill="#FFFFFF" />
            {children}
        </svg>
    );
}

export function VisaMark(props: IconProps) {
    return (
        <Card {...props}>
            <text
                x="19"
                y="16.4"
                textAnchor="middle"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="9.5"
                fontWeight="700"
                fontStyle="italic"
                letterSpacing="0.4"
                fill="#1A1F71"
            >
                VISA
            </text>
        </Card>
    );
}

export function MastercardMark(props: IconProps) {
    return (
        <Card {...props}>
            <circle cx="15.4" cy="12" r="6.1" fill="#EB001B" />
            <circle cx="22.6" cy="12" r="6.1" fill="#F79E1B" />
            <path
                fill="#FF5F00"
                d="M19 7.1a6.1 6.1 0 0 0 0 9.8 6.1 6.1 0 0 0 0-9.8Z"
            />
        </Card>
    );
}

export function JcbMark(props: IconProps) {
    return (
        <Card {...props}>
            <rect
                x="6.5"
                y="5"
                width="7.4"
                height="14"
                rx="2.4"
                fill="#0E4C96"
            />
            <rect
                x="15.3"
                y="5"
                width="7.4"
                height="14"
                rx="2.4"
                fill="#BE0034"
            />
            <rect
                x="24.1"
                y="5"
                width="7.4"
                height="14"
                rx="2.4"
                fill="#008D53"
            />
            <text
                x="19"
                y="15.6"
                textAnchor="middle"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="7.5"
                fontWeight="700"
                fill="#FFFFFF"
            >
                JCB
            </text>
        </Card>
    );
}

export function AmexMark(props: IconProps) {
    return (
        <Card {...props}>
            <rect
                x="1.5"
                y="1.5"
                width="35"
                height="21"
                rx="2"
                fill="#006FCF"
            />
            <text
                x="19"
                y="14.6"
                textAnchor="middle"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="6.2"
                fontWeight="700"
                letterSpacing="0.2"
                fill="#FFFFFF"
            >
                AMEX
            </text>
        </Card>
    );
}

export function PayPalMark(props: IconProps) {
    return (
        <Card {...props}>
            <path
                fill="#003087"
                d="M12.6 6.2h5.1c2.7 0 4.2 1.4 3.8 3.8-.4 2.6-2.3 3.9-5 3.9h-1.7l-.7 4.1h-2.9Zm2.5 5.4h1.2c1.2 0 2-.5 2.2-1.6.2-1-.4-1.5-1.5-1.5h-1.3Z"
            />
            <path
                fill="#009CDE"
                d="M19.7 8.4h5c2.7 0 4.2 1.4 3.8 3.8-.4 2.6-2.3 3.9-5 3.9h-1.7l-.7 4.1h-2.9Zm2.5 5.4h1.2c1.2 0 2-.5 2.2-1.6.2-1-.4-1.5-1.5-1.5h-1.3Z"
            />
        </Card>
    );
}

const PAYMENT_MARKS: Record<
    PaymentMethod,
    (props: IconProps) => React.JSX.Element
> = {
    visa: VisaMark,
    mastercard: MastercardMark,
    jcb: JcbMark,
    amex: AmexMark,
    paypal: PayPalMark,
};

export function PaymentMark({
    method,
    ...props
}: IconProps & { method: PaymentMethod }) {
    const Mark = PAYMENT_MARKS[method];

    return <Mark {...props} />;
}
