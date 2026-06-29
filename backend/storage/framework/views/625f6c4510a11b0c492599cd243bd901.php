<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color:#0a0a0a;color:#ffffff;font-family:Helvetica,Arial,sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#d4af37,#f5d061);padding:40px;text-align:center;"><h1 style="color:#0a0a0a;font-size:28px;margin:0;">New Contact Message</h1></td></tr>
        <tr><td style="padding:40px;">
          <table width="100%" cellpadding="12" style="background-color:#1a1a2e;border-radius:12px;">
            <tr><td style="color:#a1a1aa;font-size:12px;">Name</td><td style="color:#ffffff;font-size:14px;text-align:right;"><?php echo e($name); ?></td></tr>
            <tr><td style="color:#a1a1aa;font-size:12px;">Email</td><td style="color:#ffffff;font-size:14px;text-align:right;"><?php echo e($email); ?></td></tr>
            <tr><td style="color:#a1a1aa;font-size:12px;">Subject</td><td style="color:#ffffff;font-size:14px;text-align:right;"><?php echo e($subject ?? 'General'); ?></td></tr>
          </table>
          <div style="background-color:#1a1a2e;border-radius:12px;padding:20px;margin:20px 0;">
            <p style="color:#a1a1aa;font-size:12px;margin:0 0 10px;">Message:</p>
            <p style="color:#ffffff;font-size:14px;line-height:1.6;margin:0;"><?php echo e($message); ?></p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
<?php /**PATH C:\Users\USER\OneDrive\Desktop\portfolio V3\backend\resources\views\emails\contact.blade.php ENDPATH**/ ?>