<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice <?php echo e($invoice->invoice_number); ?></title>
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
    .invoice-wrapper {
      position: relative;
      z-index: 1;
    }
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
    .brand .tagline {
      font-size: 8px;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .brand .contact {
      font-size: 8px;
      color: #71717a;
      margin-top: 6px;
      line-height: 1.6;
    }
    .title-section {
      text-align: right;
    }
    .title-section .invoice-title {
      font-size: 26px;
      font-weight: 800;
      color: #1a1a2e;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .title-section .invoice-number {
      font-size: 11px;
      color: #d4af37;
      font-weight: 700;
      margin: 2px 0;
    }
    .title-section .invoice-status {
      display: inline-block;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      padding: 3px 14px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .status-paid { background: #059669; color: #ffffff; }
    .status-partial { background: #d97706; color: #ffffff; }
    .status-unpaid { background: #dc2626; color: #ffffff; }
    .status-overdue { background: #7f1d1d; color: #ffffff; }
    .status-cancelled { background: #6b7280; color: #ffffff; }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .info-block {
      width: 48%;
    }
    .info-block h3 {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a1a1aa;
      margin: 0 0 6px 0;
      font-weight: 700;
    }
    .info-block .name {
      font-size: 12px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 2px 0;
    }
    .info-block .detail {
      font-size: 9px;
      color: #52525b;
      margin: 1px 0;
      line-height: 1.5;
    }
    .info-block .detail-label {
      color: #a1a1aa;
    }
    .info-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
    }
    .info-grid .item {
      flex: 0 0 auto;
      min-width: 100px;
    }
    .info-grid .item .label {
      font-size: 7px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #a1a1aa;
      font-weight: 700;
    }
    .info-grid .item .value {
      font-size: 10px;
      font-weight: 600;
      color: #1a1a2e;
    }

    table.items {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0 20px 0;
    }
    table.items thead th {
      background: #1a1a2e;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: left;
      font-weight: 700;
    }
    table.items thead th.amt { text-align: right; }
    table.items tbody td {
      padding: 8px 10px;
      font-size: 9px;
      border-bottom: 1px solid #e4e4e7;
      color: #3f3f46;
    }
    table.items tbody td.amt { text-align: right; }
    table.items tbody tr:last-child td { border-bottom: none; }

    .totals {
      margin-left: auto;
      width: 280px;
    }
    .totals table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals table td {
      padding: 4px 10px;
      font-size: 9px;
      color: #52525b;
    }
    .totals table td.label { text-align: left; }
    .totals table td.amount { text-align: right; }
    .totals table tr.subtotal td { padding-top: 8px; }
    .totals table tr.grand-total td {
      font-size: 13px;
      font-weight: 800;
      color: #1a1a2e;
      padding-top: 8px;
      border-top: 2px solid #1a1a2e;
    }
    .totals table tr.discount td { color: #dc2626; }
    .totals table tr.balance td {
      font-size: 11px;
      font-weight: 700;
      color: #d97706;
      padding-top: 6px;
      border-top: 1px dashed #d4d4d8;
    }
    .totals table tr.balance.positive td { color: #059669; }

    .payment-history {
      margin: 24px 0;
    }
    .payment-history h3 {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a1a1aa;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    .payment-history table {
      width: 100%;
      border-collapse: collapse;
    }
    .payment-history table th {
      background: #f4f4f5;
      color: #52525b;
      padding: 6px 10px;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: left;
      font-weight: 700;
    }
    .payment-history table th.amt { text-align: right; }
    .payment-history table td {
      padding: 6px 10px;
      font-size: 9px;
      border-bottom: 1px solid #f4f4f5;
      color: #3f3f46;
    }
    .payment-history table td.amt { text-align: right; }

    .notes-section {
      margin: 24px 0;
      padding: 16px 20px;
      background: #fafafa;
      border-left: 3px solid #d4af37;
      border-radius: 2px;
    }
    .notes-section h3 {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a1a1aa;
      margin: 0 0 6px 0;
      font-weight: 700;
    }
    .notes-section p {
      font-size: 9px;
      color: #52525b;
      margin: 2px 0;
      line-height: 1.6;
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e4e4e7;
      text-align: center;
    }
    .footer p {
      font-size: 8px;
      color: #a1a1aa;
      margin: 2px 0;
    }
    .footer .brand-name {
      font-size: 10px;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>

  <?php
    $currency = $order->currency ?? 'NGN';
    $symbol = $currency === 'NGN' ? '₦' : '$';

    $subtotal = $currency === 'NGN' ? $invoice->subtotal_ngn : $invoice->subtotal_usd;
    $discount = $currency === 'NGN' ? $invoice->discount_ngn : $invoice->discount_usd;
    $tax = $currency === 'NGN' ? $invoice->tax_ngn : $invoice->tax_usd;
    $total = $currency === 'NGN' ? $invoice->total_ngn : $invoice->total_usd;
    $amountPaid = $currency === 'NGN' ? $invoice->amount_paid_ngn : $invoice->amount_paid_usd;
    $balance = $currency === 'NGN' ? $invoice->balance_ngn : $invoice->balance_usd;

    $user = $order->user;
    $profile = $user?->profile;
    $billing = $order->billing_details;
  ?>

  <div class="watermark"><?php echo e(\App\Helpers\PdfHelper::watermarkText($invoice->status)); ?></div>

  <div class="invoice-wrapper">

    
    <div class="header">
      <div class="brand">
        <h1>CODEMAFIA</h1>
        <div class="tagline">Engineering Excellence. Inspiring Innovation.</div>
        <div class="contact">
          Lagos, Nigeria<br>
          hello@codemafia.ng<br>
          codemafia.ng
        </div>
      </div>
      <div class="title-section">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number"><?php echo e($invoice->invoice_number); ?></div>
        <div class="invoice-status"><?php echo \App\Helpers\PdfHelper::statusBadge($invoice->status); ?></div>
      </div>
    </div>

    
    <div class="info-row">
      <div class="info-block">
        <h3>Bill To</h3>
        <div class="name"><?php echo e($billing['full_name'] ?? $profile?->full_name ?? $user?->email ?? 'N/A'); ?></div>
        <div class="detail"><?php echo e($billing['email'] ?? $user?->email ?? ''); ?></div>
        <?php if(!empty($billing['phone']) || !empty($profile?->phone)): ?>
          <div class="detail"><?php echo e($billing['phone'] ?? $profile?->phone); ?></div>
        <?php endif; ?>
        <?php if(!empty($billing['company'])): ?>
          <div class="detail"><?php echo e($billing['company']); ?></div>
        <?php endif; ?>
        <?php if(!empty($billing['address']) || !empty($billing['city']) || !empty($billing['state']) || !empty($billing['country'])): ?>
          <div class="detail">
            <?php $addr = []; ?>
            <?php if(!empty($billing['address'])): ?> <?php $addr[] = $billing['address']; ?> <?php endif; ?>
            <?php if(!empty($billing['city'])): ?> <?php $addr[] = $billing['city']; ?> <?php endif; ?>
            <?php if(!empty($billing['state'])): ?> <?php $addr[] = $billing['state']; ?> <?php endif; ?>
            <?php if(!empty($billing['country'])): ?> <?php $addr[] = $billing['country']; ?> <?php endif; ?>
            <?php echo e(implode(', ', $addr)); ?>

          </div>
        <?php endif; ?>
      </div>
      <div class="info-block">
        <div class="info-grid">
          <div class="item">
            <div class="label">Invoice #</div>
            <div class="value"><?php echo e($invoice->invoice_number); ?></div>
          </div>
          <div class="item">
            <div class="label">Status</div>
            <div class="value"><?php echo e(\App\Helpers\PdfHelper::invoiceStatus($invoice->status)); ?></div>
          </div>
          <div class="item">
            <div class="label">Issue Date</div>
            <div class="value"><?php echo e($invoice->created_at->format('M d, Y')); ?></div>
          </div>
          <?php if($invoice->due_date): ?>
          <div class="item">
            <div class="label">Due Date</div>
            <div class="value"><?php echo e($invoice->due_date->format('M d, Y')); ?></div>
          </div>
          <?php endif; ?>
          <div class="item">
            <div class="label">Payment Type</div>
            <div class="value"><?php echo e(ucfirst($invoice->payment_type ?? 'Full')); ?></div>
          </div>
          <div class="item">
            <div class="label">Order #</div>
            <div class="value"><?php echo e($order->order_number); ?></div>
          </div>
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
          <td>
            <strong><?php echo e($order->package?->name ?? 'Service Package'); ?></strong>
            <?php if($order->service || $order->projectType): ?>
              <br><span style="font-size:8px;color:#a1a1aa;">
                <?php echo e($order->service?->title ?? ''); ?><?php echo e($order->service && $order->projectType ? ' — ' : ''); ?><?php echo e($order->projectType?->title ?? ''); ?>

              </span>
            <?php endif; ?>
          </td>
          <td>1</td>
          <td class="amt"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($currency === 'NGN' ? $order->package_price_ngn : $order->package_price_usd, $currency)); ?></td>
          <td class="amt"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($currency === 'NGN' ? $order->package_price_ngn : $order->package_price_usd, $currency)); ?></td>
        </tr>

        
        <?php if($order->addOns && $order->addOns->count() > 0): ?>
          <?php $__currentLoopData = $order->addOns; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $addOn): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
              $addOnPrice = $currency === 'NGN' ? ($addOn->price_ngn ?? 0) : ($addOn->price_usd ?? 0);
            ?>
            <tr>
              <td><?php echo e($addOn->name ?? $addOn->addOn?->name ?? 'Add-on'); ?></td>
              <td>1</td>
              <td class="amt"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($addOnPrice, $currency)); ?></td>
              <td class="amt"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($addOnPrice, $currency)); ?></td>
            </tr>
          <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        <?php endif; ?>
      </tbody>
    </table>

    
    <div class="totals">
      <table>
        <tr class="subtotal">
          <td class="label">Subtotal</td>
          <td class="amount"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($subtotal, $currency)); ?></td>
        </tr>
        <?php if($discount > 0): ?>
        <tr class="discount">
          <td class="label">Discount<?php echo e($invoice->discount_code ? ' (' . $invoice->discount_code . ')' : ''); ?></td>
          <td class="amount">-<?php echo e(\App\Helpers\PdfHelper::formatCurrency($discount, $currency)); ?></td>
        </tr>
        <?php endif; ?>
        <?php if($tax > 0): ?>
        <tr>
          <td class="label">Tax</td>
          <td class="amount"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($tax, $currency)); ?></td>
        </tr>
        <?php endif; ?>
        <tr class="grand-total">
          <td class="label">Grand Total</td>
          <td class="amount"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($total, $currency)); ?></td>
        </tr>
        <?php if($amountPaid > 0): ?>
        <tr>
          <td class="label">Amount Paid</td>
          <td class="amount" style="color:#059669;"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($amountPaid, $currency)); ?></td>
        </tr>
        <?php endif; ?>
        <?php if($balance > 0): ?>
        <tr class="balance">
          <td class="label">Remaining Balance</td>
          <td class="amount"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($balance, $currency)); ?></td>
        </tr>
        <?php elseif($amountPaid > 0): ?>
        <tr class="balance positive">
          <td class="label">Balance</td>
          <td class="amount"><?php echo e(\App\Helpers\PdfHelper::formatCurrency(0, $currency)); ?></td>
        </tr>
        <?php endif; ?>
      </table>
    </div>

    
    <?php
      $payments = $invoice->relationLoaded('payments') ? $invoice->payments : $order->payments;
    ?>
    <?php if($payments && $payments->count() > 0): ?>
    <div class="payment-history">
      <h3>Payment History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Gateway</th>
            <th class="amt">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <?php $__currentLoopData = $payments; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $payment): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <tr>
              <td><?php echo e($payment->paid_at?->format('M d, Y') ?? $payment->created_at->format('M d, Y')); ?></td>
              <td><?php echo e($payment->reference); ?></td>
              <td><?php echo e(ucfirst($payment->gateway ?? 'N/A')); ?></td>
              <td class="amt"><?php echo e(\App\Helpers\PdfHelper::formatCurrency($currency === 'NGN' ? ($payment->amount_ngn ?? 0) : ($payment->amount_usd ?? 0), $currency)); ?></td>
              <td><?php echo e(ucfirst($payment->status)); ?></td>
            </tr>
          <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
      </table>
    </div>
    <?php endif; ?>

    
    <?php if($invoice->notes): ?>
    <div class="notes-section">
      <h3>Notes</h3>
      <p><?php echo e($invoice->notes); ?></p>
    </div>
    <?php endif; ?>

    
    <?php if(!empty($order->proposals) && $order->proposals->isNotEmpty() && $order->proposals->first()->terms_and_conditions): ?>
      <div class="notes-section" style="border-left-color:#a1a1aa;">
        <h3>Terms &amp; Conditions</h3>
        <?php $__currentLoopData = $order->proposals->first()->terms_and_conditions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $term): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
          <p>• <?php echo e($term); ?></p>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
      </div>
    <?php else: ?>
      <div class="notes-section" style="border-left-color:#a1a1aa;">
        <h3>Terms &amp; Conditions</h3>
        <p>Payment is due within 30 days of the invoice date.</p>
        <p>All prices are in <?php echo e($currency === 'NGN' ? 'Nigerian Naira (₦)' : 'US Dollars ($)'); ?>.</p>
        <p>For questions regarding this invoice, please contact hello@codemafia.ng.</p>
      </div>
    <?php endif; ?>

    
    <div class="footer">
      <p class="brand-name">CODEMAFIA</p>
      <p>Engineering Excellence. Inspiring Innovation.</p>
      <p>Lagos, Nigeria &nbsp;|&nbsp; hello@codemafia.ng &nbsp;|&nbsp; codemafia.ng</p>
      <p style="margin-top:4px;"><?php echo e(copyright()); ?></p>
      <p>This invoice was generated automatically.</p>
    </div>

  </div>
</body>
</html>
<?php /**PATH C:\Users\USER\OneDrive\Desktop\portfolio V3\backend\resources\views/pdf/service-invoice.blade.php ENDPATH**/ ?>