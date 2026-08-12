{{--
    The packing slip (§8).

    A Blade document rather than an Inertia page: it goes in a box, so it has
    to print identically with no JavaScript, and it carries its own styles
    rather than loading the console's bundle. `@media print` hides the one
    control on it so the printed sheet has no button on it.
--}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ __('admin.orders.packing_slip') }} — {{ $order->order_number }}</title>

    <style>
        :root {
            --forest: #1f2a1c;
            --gold: #c08a2f;
            --ink: #26221d;
            --ink-muted: #6e6559;
            --line: #e5dbc9;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            padding: 32px;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
            font-size: 13px;
            line-height: 1.55;
            color: var(--ink);
            background: #fff;
        }

        .sheet { max-width: 760px; margin: 0 auto; }

        header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--forest);
        }

        .wordmark {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 28px;
            letter-spacing: 0.06em;
            color: var(--forest);
        }

        .tagline {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--ink-muted);
        }

        .doc-title { text-align: right; }
        .doc-title h1 { margin: 0; font-size: 16px; }
        .doc-title p { margin: 2px 0 0; color: var(--ink-muted); }

        .grid {
            display: flex;
            gap: 40px;
            margin: 24px 0;
        }

        .grid section { flex: 1; }

        h2 {
            margin: 0 0 6px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--gold);
        }

        address { font-style: normal; }

        table { width: 100%; border-collapse: collapse; margin-top: 8px; }

        th {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid var(--forest);
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--ink-muted);
        }

        td { padding: 8px; border-bottom: 1px solid var(--line); vertical-align: top; }

        .numeric { text-align: right; font-variant-numeric: tabular-nums; }
        .sku { color: var(--ink-muted); font-size: 11px; }

        tfoot td { border-bottom: 0; padding-top: 6px; }
        tfoot tr:last-child td { border-top: 1px solid var(--forest); font-weight: 600; }

        .notes {
            margin-top: 24px;
            padding: 12px;
            border: 1px solid var(--line);
            white-space: pre-line;
            color: var(--ink-muted);
        }

        footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid var(--line);
            text-align: center;
            color: var(--ink-muted);
        }

        .print-button {
            display: block;
            margin: 0 auto 24px;
            padding: 8px 20px;
            border: 1px solid var(--forest);
            border-radius: 4px;
            background: var(--forest);
            color: #fff;
            font: inherit;
            cursor: pointer;
        }

        @media print {
            body { padding: 0; }
            .print-button { display: none; }
        }
    </style>
</head>
<body>
    <button type="button" class="print-button" onclick="window.print()">
        {{ __('admin.orders.print') }}
    </button>

    <div class="sheet">
        <header>
            <div>
                <div class="wordmark">DRIO</div>
                <div class="tagline">{{ __('admin.orders.tagline') }}</div>
            </div>

            <div class="doc-title">
                <h1>{{ __('admin.orders.packing_slip') }}</h1>
                <p>{{ $order->order_number }}</p>
                <p>{{ $order->created_at?->toDateString() }}</p>
            </div>
        </header>

        <div class="grid">
            <section>
                <h2>{{ __('admin.orders.ship_to') }}</h2>
                <address>
                    {{ $order->customer_name }}<br>
                    〒{{ $order->postal_code }}<br>
                    {{ $order->prefecture }}, {{ $order->city }}<br>
                    {{ $order->address_line1 }}
                    @if ($order->address_line2)
                        <br>{{ $order->address_line2 }}
                    @endif
                </address>
            </section>

            <section>
                <h2>{{ __('admin.orders.contact') }}</h2>
                <p style="margin:0">
                    {{ $order->customer_email }}
                    @if ($order->customer_phone)
                        <br>{{ $order->customer_phone }}
                    @endif
                </p>

                <h2 style="margin-top:16px">{{ __('admin.orders.status') }}</h2>
                <p style="margin:0">{{ $order->status->label() }}</p>
            </section>
        </div>

        <table>
            <thead>
                <tr>
                    <th>{{ __('admin.orders.item') }}</th>
                    <th class="numeric">{{ __('admin.orders.quantity') }}</th>
                    <th class="numeric">{{ __('admin.orders.unit_price') }}</th>
                    <th class="numeric">{{ __('admin.orders.line_total') }}</th>
                </tr>
            </thead>

            <tbody>
                @foreach ($order->items as $item)
                    <tr>
                        <td>
                            {{ $item->product_name_snapshot }}
                            <div class="sku">{{ $item->sku_snapshot }}</div>
                        </td>
                        <td class="numeric">{{ $item->quantity }}</td>
                        <td class="numeric">{{ $money($item->unit_price_minor) }}</td>
                        <td class="numeric">{{ $money($item->line_total_minor) }}</td>
                    </tr>
                @endforeach
            </tbody>

            <tfoot>
                <tr>
                    <td colspan="3" class="numeric">{{ __('admin.orders.subtotal') }}</td>
                    <td class="numeric">{{ $money($order->subtotal_minor) }}</td>
                </tr>
                <tr>
                    <td colspan="3" class="numeric">{{ __('admin.orders.shipping') }}</td>
                    <td class="numeric">{{ $money($order->shipping_minor) }}</td>
                </tr>
                <tr>
                    <td colspan="3" class="numeric">{{ __('admin.orders.total') }}</td>
                    <td class="numeric">{{ $money($order->total_minor) }}</td>
                </tr>
            </tfoot>
        </table>

        @if ($order->notes)
            <div class="notes">
                <h2>{{ __('admin.orders.notes') }}</h2>
                {{ $order->notes }}
            </div>
        @endif

        <footer>{{ __('admin.orders.slip_footer') }}</footer>
    </div>
</body>
</html>
