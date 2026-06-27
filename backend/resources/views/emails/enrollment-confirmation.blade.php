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
              <h1 style="color:#0a0a0a;font-size:28px;margin:0;">🎉 Welcome to CODEMAFIA Academy!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#d4af37;margin:0 0 20px;">Hello {{ $student_name }},</p>
              <p style="font-size:14px;color:#a1a1aa;line-height:1.6;margin:0 0 20px;">
                Welcome aboard! You have successfully enrolled in
                <strong style="color:#ffffff;">{{ $course_name }}</strong>.
              </p>
              <table width="100%" cellpadding="12" style="background-color:#1a1a2e;border-radius:12px;margin:20px 0;">
                <tr>
                  <td style="color:#a1a1aa;font-size:12px;">Enrollment ID</td>
                  <td style="color:#ffffff;font-size:14px;font-weight:bold;text-align:right;font-family:monospace;">{{ $enrollment_number }}</td>
                </tr>
              </table>
              <a href="{{ $dashboard_url }}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#f5d061);color:#0a0a0a;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:14px;margin:20px 0;">Go to Dashboard</a>
              <p style="font-size:12px;color:#52525b;margin:20px 0 0;">
                Need help? Contact us at
                <a href="mailto:academy@codemafia.ng" style="color:#d4af37;">academy@codemafia.ng</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
