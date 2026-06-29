<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; background: #0a0a0a; color: #fff; padding: 40px; margin: 0; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #d4af37; font-size: 28px; margin: 0; }
    .header p { color: #a1a1aa; font-size: 12px; margin: 4px 0; }
    .invoice-title { color: #d4af37; font-size: 22px; text-align: right; margin: 0; }
    .invoice-meta { text-align: right; font-size: 11px; color: #a1a1aa; }
    .section-title { color: #fff; font-size: 14px; font-weight: bold; margin: 30px 0 10px; }
    .info { color: #a1a1aa; font-size: 12px; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #d4af37; color: #0a0a0a; padding: 10px; font-size: 11px; text-align: left; }
    td { padding: 10px; font-size: 11px; border-bottom: 1px solid #1a1a2e; }
    tr:nth-child(even) td { background: #1a1a2e; }
    .total-box { background: rgba(212,175,55,0.1); border-radius: 8px; padding: 15px 20px; text-align: right; margin: 20px 0; }
    .total-box .label { color: #a1a1aa; font-size: 12px; }
    .total-box .amount { color: #d4af37; font-size: 20px; font-weight: bold; }
    .paid { color: #00c896; font-size: 12px; }
    .footer { text-align: center; color: #52525b; font-size: 9px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h1><?php echo e($academy_name); ?></h1>
    <p><?php echo e($academy_address); ?></p>
    <p><?php echo e($academy_email); ?> | <?php echo e($academy_phone); ?></p>
  </div>
  <hr style="border:1px solid rgba(212,175,55,0.3);">
  <div style="display:flex;justify-content:space-between;margin:20px 0;">
    <div>
      <div style="color:#fff;font-size:14px;font-weight:bold;">Bill To:</div>
      <div class="info"><?php echo e($invoice->student_name); ?></div>
      <div class="info"><?php echo e($invoice->student_email); ?></div>
    </div>
    <div style="text-align:right;">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">#<?php echo e($invoice->invoice_number); ?></div>
      <div class="invoice-meta">Date: <?php echo e($invoice->created_at->format('M d, Y')); ?></div>
      <div class="invoice-meta">Status: <?php echo e(strtoupper($invoice->status)); ?></div>
    </div>
  </div>
  <hr style="border:1px solid rgba(212,175,55,0.3);">
  <table>
    <thead>
      <tr><th>Description</th><th>Details</th><th>Currency</th><th style="text-align:right;">Amount</th></tr>
    </thead>
    <tbody>
      <tr><td>Course Enrollment</td><td><?php echo e($invoice->course_name); ?></td><td><?php echo e($invoice->currency === 'NGN' ? 'NGN' : 'USD'); ?></td><td style="text-align:right;"><?php echo e(number_format($invoice->subtotal, 2)); ?></td></tr>
      <?php if($invoice->discount_amount > 0): ?>
      <tr><td>Discount</td><td><?php echo e($invoice->discount_code ?? 'Coupon'); ?></td><td></td><td style="text-align:right;color:#e53e3e;">-<?php echo e(number_format($invoice->discount_amount, 2)); ?></td></tr>
      <?php endif; ?>
      <tr><td>Tax</td><td><?php echo e($invoice->tax_rate * 100); ?>%</td><td></td><td style="text-align:right;"><?php echo e(number_format($invoice->tax_amount, 2)); ?></td></tr>
    </tbody>
  </table>
  <div class="total-box">
    <div class="label">Total</div>
    <div class="amount"><?php echo e($invoice->currency === 'NGN' ? 'NGN ' : '$'); ?><?php echo e(number_format($invoice->grand_total, 2)); ?></div>
  </div>
  <?php if($invoice->paid_at): ?>
  <div class="paid">Paid on: <?php echo e($invoice->paid_at->format('M d, Y')); ?></div>
  <?php endif; ?>
  <div class="footer">Thank you for choosing CODEMAFIA Academy</div>
</body>
</html>
<?php /**PATH C:\Users\USER\OneDrive\Desktop\portfolio V3\backend\resources\views\pdf\invoice.blade.php ENDPATH**/ ?>