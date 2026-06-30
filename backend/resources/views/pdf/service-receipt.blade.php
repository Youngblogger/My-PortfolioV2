<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; background: #0a0a0a; color: #fff; padding: 40px; margin: 0; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #d4af37; font-size: 28px; margin: 0; }
    .header p { color: #a1a1aa; font-size: 12px; margin: 4px 0; }
    .receipt-title { color: #d4af37; font-size: 22px; text-align: right; margin: 0; }
    .receipt-meta { text-align: right; font-size: 11px; color: #a1a1aa; margin: 2px 0; }
    .section-title { color: #fff; font-size: 14px; font-weight: bold; margin: 30px 0 10px; }
    .info { color: #a1a1aa; font-size: 12px; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #d4af37; color: #0a0a0a; padding: 10px; font-size: 11px; text-align: left; }
    td { padding: 10px; font-size: 11px; border-bottom: 1px solid #1a1a2e; }
    tr:nth-child(even) td { background: #1a1a2e; }
    .total-box { background: rgba(212,175,55,0.1); border-radius: 8px; padding: 15px 20px; text-align: right; margin: 20px 0; }
    .total-box .label { color: #a1a1aa; font-size: 12px; }
    .total-box .amount { color: #d4af37; font-size: 20px; font-weight: bold; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .status-completed { background: #00c896; color: #0a0a0a; }
    .status-pending { background: #f59e0b; color: #0a0a0a; }
    .status-failed { background: #ef4444; color: #fff; }
    .footer { text-align: center; color: #52525b; font-size: 9px; margin-top: 40px; }
    .service-detail { background: rgba(212,175,55,0.05); border-radius: 8px; padding: 15px 20px; margin: 20px 0; }
    .service-detail .row { display: flex; justify-content: space-between; margin: 4px 0; }
    .service-detail .label { color: #a1a1aa; font-size: 11px; }
    .service-detail .value { color: #fff; font-size: 11px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CODEMAFIA</h1>
    <p>Premium Digital Solutions</p>
    <p>Lagos, Nigeria</p>
  </div>
  <hr style="border:1px solid rgba(212,175,55,0.3);">
  <div style="margin:20px 0;">
    <div style="text-align:right;">
      <div class="receipt-title">PAYMENT RECEIPT</div>
      <div class="receipt-meta">Receipt #{{ $receipt->receipt_number }}</div>
      <div class="receipt-meta">Reference: {{ $receipt->servicePayment?->reference ?? 'N/A' }}</div>
      <div class="receipt-meta">Date: {{ $receipt->created_at->format('M d, Y') }}</div>
      <div class="receipt-meta">
        Status:
        <span class="status-badge status-{{ $receipt->status }}">
          {{ strtoupper($receipt->status) }}
        </span>
      </div>
    </div>
  </div>

  <div class="service-detail">
    <div class="row">
      <span class="label">Order</span>
      <span class="value">#{{ $order->order_number }}</span>
    </div>
    <div class="row">
      <span class="label">Service</span>
      <span class="value">{{ $order->service?->title ?? 'N/A' }}</span>
    </div>
    <div class="row">
      <span class="label">Project Type</span>
      <span class="value">{{ $order->projectType?->title ?? 'N/A' }}</span>
    </div>
    <div class="row">
      <span class="label">Package</span>
      <span class="value">{{ $order->package?->name ?? 'N/A' }}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Description</th><th>Gateway</th><th>Currency</th><th style="text-align:right;">Amount</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Service Payment - {{ $receipt->payment_type ?? 'Full' }}</td>
        <td>{{ $receipt->payment_gateway ?? 'N/A' }}</td>
        <td>{{ $receipt->currency ?? 'NGN' }}</td>
        <td style="text-align:right;">{{ number_format((float)$receipt->amount_ngn, 2) }}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    <div class="label">Total Paid</div>
    <div class="amount">{{ ($receipt->currency ?? 'NGN') === 'NGN' ? 'NGN ' : '$' }}{{ number_format((float)$receipt->amount_ngn, 2) }}</div>
  </div>

  <div class="info" style="margin-top:10px;">
    Payment Gateway: {{ $receipt->payment_gateway ?? 'N/A' }}<br>
    Payment Type: {{ ucfirst($receipt->payment_type ?? 'Full') }}
  </div>

  <div class="footer">Thank you for choosing CODEMAFIA — Engineering Excellence. Inspiring Innovation.</div>
</body>
</html>
