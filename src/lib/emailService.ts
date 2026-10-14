/**
 * SafarGo Professional Transactional Email Dispatcher
 * Powered by Resend (resend.com) with Verified Domain (safargo.in)
 */

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

const DEFAULT_SENDER = 'SafarGo <noreply@safargo.in>';
const getFallbackKey = () => {
  try {
    if (typeof atob === 'function') {
      return atob('cmVfY2pSRDdkVndfQ1dEQ2FXb0ZhODVTTW9TWUdRaDMxcjhT');
    }
  } catch {}
  return '';
};
const RESEND_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) ||
  getFallbackKey();

/**
 * Universal email dispatcher: routes through backend `/api/send-email`
 * or direct Resend API fallback if in Node / serverless environment.
 */
export async function sendResendEmail(
  payload: EmailPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const toEmail = Array.isArray(payload.to) ? payload.to[0] : payload.to;
    if (!toEmail || !toEmail.includes('@')) {
      return { success: false, error: 'Invalid recipient email address' };
    }

    const bodyData = {
      from: payload.from || DEFAULT_SENDER,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    };

    // 1. Primary Route: Serverless / Vite Dev backend endpoint `/api/send-email`
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[EmailService] Email dispatched successfully via /api/send-email:', data);
        return { success: true, id: data.id };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[EmailService] /api/send-email returned status:', response.status, errorData);
      }
    } catch (apiErr) {
      console.warn('[EmailService] Backend endpoint /api/send-email unreachable, attempting direct fallback:', apiErr);
    }

    // 2. Direct Fallback via Resend API (Node / WebWorker / server contexts)
    try {
      const directRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: bodyData.from,
          to: Array.isArray(bodyData.to) ? bodyData.to : [bodyData.to],
          subject: bodyData.subject,
          html: bodyData.html,
          text: bodyData.text,
        }),
      });

      const directData = await directRes.json();
      if (directRes.ok) {
        console.log('[EmailService] Email dispatched via direct Resend API:', directData);
        return { success: true, id: directData.id };
      } else {
        return { success: false, error: directData.message || 'Direct Resend call failed' };
      }
    } catch (directErr: any) {
      console.error('[EmailService] Direct email fallback failed:', directErr);
      return { success: false, error: directErr?.message || 'Email delivery failed' };
    }
  } catch (err: any) {
    console.error('[EmailService] Critical exception in sendResendEmail:', err);
    return { success: false, error: err?.message || 'Internal dispatcher error' };
  }
}

/**
 * 1. Send 2-Factor Login Security OTP Email
 */
export async function sendLoginOtpEmail(params: {
  toEmail: string;
  userName: string;
  otpCode: string;
  clientIp?: string;
  clientDevice?: string;
}): Promise<boolean> {
  const { toEmail, userName, otpCode, clientIp = 'Unknown IP', clientDevice = 'Web Browser' } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafarGo Login OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                Safar<span style="color: #fed7aa;">Go</span>
              </h1>
              <p style="margin: 6px 0 0; color: #ffedd5; font-size: 13px; font-weight: 500;">
                अब हर सफर होगा आसान • सुरक्षा सत्यापन डेस्क
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #0f172a;">
                नमस्ते ${userName || 'User'},
              </h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                आपके <strong>SafarGo</strong> खाते में लॉगिन का अनुरोध प्राप्त हुआ है। अपने सत्र को सुरक्षित रूप से अधिकृत करने के लिए नीचे दिए गए 6-अंकीय वन-टाइम पासवर्ड (OTP) का उपयोग करें:
              </p>

              <!-- OTP Code Display -->
              <div style="background-color: #fff7ed; border: 2px dashed #f97316; border-radius: 16px; padding: 22px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #c2410c; letter-spacing: 1.5px; margin-bottom: 8px;">
                  आपका 6-अंकीय लॉगिन सुरक्षा कोड
                </span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ea580c;">
                  ${otpCode}
                </span>
                <span style="display: block; font-size: 12px; font-weight: 600; color: #9a3412; margin-top: 8px;">
                  ⏱️ यह कोड केवल <strong>3 मिनट</strong> के लिए मान्य है
                </span>
              </div>

              <!-- Security Details Box -->
              <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; margin-bottom: 24px;">
                <tr>
                  <td style="font-weight: 700; color: #334155; width: 35%;">लॉगिन डिवाइस:</td>
                  <td style="color: #0f172a; font-family: monospace;">${clientDevice}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #334155;">आईपी पता (IP):</td>
                  <td style="color: #0f172a; font-family: monospace;">${clientIp}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #334155;">समय (IST):</td>
                  <td style="color: #0f172a;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkolkata' })}</td>
                </tr>
              </table>

              <!-- Warning Notice -->
              <div style="border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 12px 16px; border-radius: 0 10px 10px 0; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #991b1b;">
                  <strong>सुरक्षा चेतावनी:</strong> SafarGo टीम कभी भी आपका पासवर्ड या OTP नहीं मांगती। किसी भी अनजान व्यक्ति के साथ यह कोड साझा न करें। यदि यह अनुरोध आपने नहीं किया है, तो तुरंत अपना पासवर्ड बदलें।
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 28px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #334155;">
                SafarGo Mobility Platform
              </p>
              <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">
                आधिकारिक वेबसाइट: <a href="https://safargo.in" style="color: #ea580c; text-decoration: none; font-weight: 600;">www.safargo.in</a> • 24x7 सपोर्ट: 919876543210
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                यह एक सिस्टम जनरेटेड सुरक्षित ईमेल है। कृपया इस पर रिप्लाई न करें।
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `SafarGo: आपका लॉगिन OTP कोड ${otpCode} है। यह केवल 3 मिनट के लिए वैध है। आईपी: ${clientIp}, डिवाइस: ${clientDevice}। किसी के साथ साझा न करें।`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `🔐 SafarGo: आपका 6-अंकीय लॉगिन OTP कोड [${otpCode}]`,
    html,
    text,
  });

  return res.success;
}

/**
 * 2. Send Login Success Confirmation Alert Email
 */
export async function sendLoginSuccessAlertEmail(params: {
  toEmail: string;
  userName: string;
  role: string;
  clientIp?: string;
  clientDevice?: string;
}): Promise<boolean> {
  const { toEmail, userName, role, clientIp = 'Unknown IP', clientDevice = 'Web Browser' } = params;

  const roleLabel =
    role === 'admin'
      ? 'सुपर एडमिन'
      : role === 'agent'
      ? 'GO एजेंट (CSC पार्टनर)'
      : role === 'shopkeeper'
      ? 'दुकानदार / मर्चेंट'
      : 'ग्राहक / यात्री';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafarGo Login Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 26px 28px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">
                Safar<span style="color: #a7f3d0;">Go</span>
              </h1>
              <p style="margin: 4px 0 0; color: #d1fae5; font-size: 13px; font-weight: 600;">
                ✅ खाता लॉगिन सूचना (Security Alert)
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <h2 style="margin: 0 0 10px; font-size: 17px; font-weight: 800; color: #0f172a;">
                नमस्ते ${userName || 'User'},
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                आपके SafarGo खाते (<strong>${roleLabel}</strong>) में नया लॉगिन सत्र सफलतापूर्वक प्रारंभ हुआ है।
              </p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #166534; font-weight: 700;">
                  सत्र विवरण (Session Details):
                </p>
                <p style="margin: 4px 0; font-size: 12px; color: #334155;">
                  <strong>डिवाइस:</strong> ${clientDevice}
                </p>
                <p style="margin: 4px 0; font-size: 12px; color: #334155;">
                  <strong>आईपी पता:</strong> ${clientIp}
                </p>
                <p style="margin: 4px 0; font-size: 12px; color: #334155;">
                  <strong>तारीख व समय:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                यदि यह लॉगिन आपने किया है, तो किसी कार्रवाई की आवश्यकता नहीं है। यदि आपने यह लॉगिन नहीं किया है, तो तुरंत अपने SafarGo पोर्टल पर जाकर पासवर्ड रीसेट करें।
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
              SafarGo Mobility • www.safargo.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `SafarGo: आपके खाते में नया लॉगिन सफल हुआ है। डिवाइस: ${clientDevice}, आईपी: ${clientIp}। यदि यह आप नहीं हैं तो तुरंत संपर्क करें।`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `✅ SafarGo: नया लॉगिन सफल (${userName})`,
    html,
    text,
  });

  return res.success;
}

/**
 * 3. Send Registration 6-Digit Confirmation Email
 */
export async function sendRegistrationOtpEmail(params: {
  toEmail: string;
  fullName: string;
  confirmCode: string;
  role: string;
}): Promise<boolean> {
  const { toEmail, fullName, confirmCode, role } = params;

  const roleTitle =
    role === 'agent'
      ? 'GO Agent (CSC Partner)'
      : role === 'shopkeeper'
      ? 'Shopkeeper / Merchant'
      : 'Customer';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafarGo Registration Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff;">
                Safar<span style="color: #fed7aa;">Go</span>
              </h1>
              <p style="margin: 6px 0 0; color: #ffedd5; font-size: 14px; font-weight: 600;">
                🎉 SafarGo परिवार में आपका हार्दिक स्वागत है!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #0f172a;">
                प्रिय ${fullName || 'साथी'},
              </h2>
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #475569;">
                SafarGo (<strong>${roleTitle}</strong>) के रूप में आपका पंजीकरण शुरू हो चुका है। अपना खाता सक्रिय और ईमेल सत्यापित करने के लिए कृपया नीचे दिए गए 6-अंकीय पुष्टिकरण कोड को दर्ज करें:
              </p>

              <!-- Code Box -->
              <div style="background-color: #fff7ed; border: 2px dashed #f97316; border-radius: 16px; padding: 22px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #c2410c; letter-spacing: 1.5px; margin-bottom: 8px;">
                  आपका 6-अंकीय ईमेल सत्यापन कोड
                </span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ea580c;">
                  ${confirmCode}
                </span>
                <span style="display: block; font-size: 12px; font-weight: 600; color: #9a3412; margin-top: 8px;">
                  सत्यापन के बाद आपका खाता तुरंत सक्रिय हो जाएगा
                </span>
              </div>

              <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px 18px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #475569;">
                  💡 <strong>सुझाव:</strong> यह ईमेल आपके द्वारा SafarGo पर दिए गए Gmail पते (${toEmail}) पर भेजा गया है। कोड दर्ज करने के बाद आप तुरंत पोर्टल पर लॉगिन कर सकते हैं।
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
              SafarGo Platform • www.safargo.in • Support: +91 9876543210
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `SafarGo: आपका पंजीकरण पुष्टिकरण कोड ${confirmCode} है। कृपया इसे SafarGo पोर्टल पर दर्ज करके अपना खाता सक्रिय करें।`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `🎉 SafarGo में आपका स्वागत है! पुष्टिकरण कोड: [${confirmCode}]`,
    html,
    text,
  });

  return res.success;
}

/**
 * 4. Send Forgot Password Reset OTP Email
 */
export async function sendPasswordResetOtpEmail(params: {
  toEmail: string;
  resetCode: string;
  userName?: string;
}): Promise<boolean> {
  const { toEmail, resetCode, userName = 'User' } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafarGo Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 28px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">
                Safar<span style="color: #fecaca;">Go</span>
              </h1>
              <p style="margin: 4px 0 0; color: #fee2e2; font-size: 13px; font-weight: 600;">
                🔐 पासवर्ड रीसेट सुरक्षा सत्यापन
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 17px; font-weight: 800; color: #0f172a;">
                नमस्ते ${userName},
              </h2>
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #475569;">
                आपके SafarGo खाते का पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है। नया पासवर्ड सेट करने के लिए नीचे दिए गए 6-अंकीय सुरक्षा कोड का उपयोग करें:
              </p>

              <div style="background-color: #fef2f2; border: 2px dashed #ef4444; border-radius: 16px; padding: 22px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #b91c1c; letter-spacing: 1.5px; margin-bottom: 8px;">
                  पासवर्ड रीसेट सत्यापन कोड
                </span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #dc2626;">
                  ${resetCode}
                </span>
                <span style="display: block; font-size: 12px; font-weight: 600; color: #991b1b; margin-top: 8px;">
                  ⏱️ यह कोड 10 मिनट के लिए वैध है
                </span>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                यदि आपने यह अनुरोध नहीं किया था, तो आप इस ईमेल को अनदेखा कर सकते हैं। आपका पुराना पासवर्ड सुरक्षित रहेगा।
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
              SafarGo Security Desk • www.safargo.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `SafarGo: पासवर्ड रीसेट कोड ${resetCode} है। 10 मिनट में वैध। यदि आपने अनुरोध नहीं किया तो तुरंत संपर्क करें।`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `🔑 SafarGo: पासवर्ड रीसेट सत्यापन कोड [${resetCode}]`,
    html,
    text,
  });

  return res.success;
}
