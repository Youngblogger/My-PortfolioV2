<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt {{ $receipt->receipt_number }}</title>
  <style>
    @page { margin: 32px 40px; }
    body {
      font-family: 'DejaVu Sans', sans-serif;
      background: #ffffff;
      color: #1a1a2e;
      padding: 0;
      margin: 0;
      font-size: 10px;
      line-height: 1.5;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 72px;
      font-weight: 900;
      color: rgba(0,0,0,0.04);
      text-transform: uppercase;
      letter-spacing: 12px;
      pointer-events: none;
      z-index: 0;
    }
    .wrapper { position: relative; z-index: 1; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 2px solid #d4af37;
      margin-bottom: 24px;
    }
    .brand h1 {
      font-size: 22px;
      color: #1a1a2e;
      margin: 0 0 2px 0;
      letter-spacing: 1px;
      font-weight: 800;
    }
    .brand .tagline { font-size: 8px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 3px; }
    .brand .contact { font-size: 8px; color: #71717a; margin-top: 6px; line-height: 1.6; }
    .title-section { text-align: right; }
    .title-section .title {
      font-size: 26px; font-weight: 800; color: #1a1a2e; margin: 0;
      text-transform: uppercase; letter-spacing: 2px;
    }
    .title-section .number { font-size: 11px; color: #d4af37; font-weight: 700; margin: 2px 0; }
    .badge {
      display: inline-block; padding: 3px 14px; border-radius: 3px;
      font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
    }
    .status-completed, .status-paid { background: #059669; color: #ffffff; }
    .status-pending { background: #d97706; color: #ffffff; }
    .status-failed { background: #dc2626; color: #ffffff; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .info-block { width: 48%; }
    .info-block h3 {
      font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px;
      color: #a1a1aa; margin: 0 0 6px 0; font-weight: 700;
    }
    .info-block .name { font-size: 12px; font-weight: 700; color: #1a1a2e; margin: 0 0 2px 0; }
    .info-block .detail { font-size: 9px; color: #52525b; margin: 1px 0; line-height: 1.5; }
    .info-grid { display: flex; flex-wrap: wrap; gap: 4px 16px; }
    .info-grid .item { flex: 0 0 auto; min-width: 100px; }
    .info-grid .item .label {
      font-size: 7px; text-transform: uppercase; letter-spacing: 1px;
      color: #a1a1aa; font-weight: 700;
    }
    .info-grid .item .value { font-size: 10px; font-weight: 600; color: #1a1a2e; }
    table.items { width: 100%; border-collapse: collapse; margin: 4px 0 20px 0; }
    table.items thead th {
      background: #1a1a2e; color: #ffffff; padding: 8px 10px;
      font-size: 8px; text-transform: uppercase; letter-spacing: 1px;
      text-align: left; font-weight: 700;
    }
    table.items thead th.amt { text-align: right; }
    table.items tbody td {
      padding: 8px 10px; font-size: 9px;
      border-bottom: 1px solid #e4e4e7; color: #3f3f46;
    }
    table.items tbody td.amt { text-align: right; }
    .total-box {
      margin-left: auto; width: 280px;
      background: #fafafa; border-radius: 4px; padding: 12px 16px;
      text-align: right;
    }
    .total-box .label { color: #a1a1aa; font-size: 10px; }
    .total-box .amount { color: #1a1a2e; font-size: 18px; font-weight: 800; }
    .footer {
      margin-top: 32px; padding-top: 16px;
      border-top: 1px solid #e4e4e7; text-align: center;
    }
    .footer p { font-size: 8px; color: #a1a1aa; margin: 2px 0; }
    .footer .brand-name { font-size: 10px; font-weight: 700; color: #d4af37; letter-spacing: 1px; }
  </style>
</head>
<body>

  @php
    $currency = $receipt->currency ?? 'NGN';
  @endphp

  <div class="watermark">RECEIPT</div>
  <div class="wrapper">

    <div class="header">
      <div class="brand">
        <h1>{{ $academy_name }}</h1>
        <div class="tagline">Learn. Build. Grow.</div>
        <div class="contact">
          {{ $academy_address }}<br>
          {{ $academy_email }}
        </div>
      </div>
      <div class="title-section">
        <div class="title">RECEIPT</div>
        <div class="number">{{ $receipt->receipt_number }}</div>
        <div style="margin-top:4px;">
          <span class="badge status-{{ $receipt->status }}">{{ strtoupper($receipt->status) }}</span>
        </div>
      </div>
    </div>

    <div class="info-row">
      <div class="info-block">
        <h3>Receipt To</h3>
        <div class="name">{{ $receipt->student_name }}</div>
        <div class="detail">{{ $receipt->user->email ?? $receipt->student_email }}</div>
      </div>
      <div class="info-block">
        <div class="info-grid">
          <div class="item">
            <div class="label">Receipt #</div>
            <div class="value">{{ $receipt->receipt_number }}</div>
          </div>
          <div class="item">
            <div class="label">Reference</div>
            <div class="value">{{ $receipt->transaction_reference }}</div>
          </div>
          <div class="item">
            <div class="label">Date</div>
            <div class="value">{{ $receipt->created_at->format('M d, Y') }}</div>
          </div>
          @if($receipt->payment_gateway)
          <div class="item">
            <div class="label">Payment Method</div>
            <div class="value">{{ $receipt->payment_gateway }}{{ $receipt->payment_method ? ' - ' . $receipt->payment_method : '' }}</div>
          </div>
          @endif
        </div>
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th style="width:50%;">Description</th>
          <th style="width:10%;">Qty</th>
          <th style="width:20%;" class="amt">Unit Price</th>
          <th style="width:20%;" class="amt">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>{{ $receipt->course_name }}</strong></td>
          <td>1</td>
          <td class="amt">{{ \App\Helpers\PdfHelper::formatCurrency($receipt->amount, $currency) }}</td>
          <td class="amt">{{ \App\Helpers\PdfHelper::formatCurrency($receipt->amount, $currency) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="label">Total Paid</div>
      <div class="amount">{{ \App\Helpers\PdfHelper::formatCurrency($receipt->amount, $currency) }}</div>
    </div>

    <div class="footer">
      <p class="brand-name">{{ $academy_name }}</p>
      <p>Learn. Build. Grow.</p>
      <p>{{ $academy_address }} &nbsp;|&nbsp; {{ $academy_email }} &nbsp;|&nbsp; codemafia.ng</p>
      <p style="margin-top:4px;">{{ copyright() }}</p>
    </div>

  </div>
</body>
</html>
