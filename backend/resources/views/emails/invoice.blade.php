<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color:#0a0a0a;color:#ffffff;font-family:Helvetica,Arial,sans-serif;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#d4af37,#f5d061);padding:40px;text-align:center;">
              <h1 style="color:#0a0a0a;font-size:28px;margin:0;">Invoice</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#d4af37;margin:0 0 20px;">Hi {{ $student_name }},</p>
              <p style="font-size:14px;color:#a1a1aa;line-height:1.6;margin:0 0 20px;">
                Your invoice for <strong style="color:#ffffff;">{{ $course_name }}</strong> is now available.
              </p>
              <table width="100%" cellpadding="12" style="background-color:#1a1a2e;border-radius:12px;margin:20px 0;">
                <tr><td style="color:#a1a1aa;font-size:12px;">Invoice No.</td><td style="color:#ffffff;font-size:12px;text-align:right;font-family:monospace;">{{ $invoice_number }}</td></tr>
                <tr><td style="color:#a1a1aa;font-size:12px;">Amount</td><td style="color:#d4af37;font-size:18px;font-weight:bold;text-align:right;">{{ $currency }} {{ $amount }}</td></tr>
                <tr><td style="color:#a1a1aa;font-size:12px;">Date</td><td style="color:#ffffff;font-size:12px;text-align:right;">{{ $date }}</td></tr>
              </table>
              <a href="{{ $invoice_url }}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#f5d061);color:#0a0a0a;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:14px;margin:20px 0;">View Invoice</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
