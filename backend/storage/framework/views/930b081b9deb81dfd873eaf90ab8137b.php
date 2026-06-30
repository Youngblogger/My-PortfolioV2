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
    .receipt-meta { text-align: right; font-size: 11px; color: #a1a1aa; }
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
      <div style="color:#fff;font-size:14px;font-weight:bold;">Receipt To:</div>
      <div class="info"><?php echo e($receipt->student_name); ?></div>
      <div class="info"><?php echo e($receipt->user->email ?? ''); ?></div>
    </div>
    <div style="text-align:right;">
      <div class="receipt-title">RECEIPT</div>
      <div class="receipt-meta">#<?php echo e($receipt->receipt_number); ?></div>
      <div class="receipt-meta">Reference: <?php echo e($receipt->transaction_reference); ?></div>
      <div class="receipt-meta">Date: <?php echo e($receipt->created_at->format('M d, Y')); ?></div>
      <div class="receipt-meta">
        Status:
        <span class="status-badge status-<?php echo e($receipt->status); ?>">
          <?php echo e(strtoupper($receipt->status)); ?>

        </span>
      </div>
    </div>
  </div>
  <hr style="border:1px solid rgba(212,175,55,0.3);">
  <table>
    <thead>
      <tr><th>Description</th><th>Details</th><th>Currency</th><th style="text-align:right;">Amount</th></tr>
    </thead>
    <tbody>
      <tr><td>Course Enrollment</td><td><?php echo e($receipt->course_name); ?></td><td><?php echo e($receipt->currency === 'NGN' ? 'NGN' : 'USD'); ?></td><td style="text-align:right;"><?php echo e(number_format($receipt->amount, 2)); ?></td></tr>
    </tbody>
  </table>
  <div class="total-box">
    <div class="label">Total Paid</div>
    <div class="amount"><?php echo e($receipt->currency === 'NGN' ? 'NGN ' : '$'); ?><?php echo e(number_format($receipt->amount, 2)); ?></div>
  </div>
  <div class="info" style="margin-top:10px;">
    Payment Method: <?php echo e($receipt->payment_gateway ?? 'N/A'); ?><?php echo e($receipt->payment_method ? ' - ' . $receipt->payment_method : ''); ?>

  </div>
  <div class="footer">Thank you for choosing CODEMAFIA Academy</div>
</body>
</html>
<?php /**PATH C:\Users\USER\OneDrive\Desktop\portfolio V3\backend\resources\views\pdf\receipt.blade.php ENDPATH**/ ?>