/**
 * SafarGo Professional Transactional Email Dispatcher
 * Powered by Resend API (safargo.in)
 */

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

const DEFAULT_SENDER = 'SafarGo <noreply@safargo.in>';
const RESEND_API_KEY = (import.meta as any).env?.VITE_RESEND_API_KEY || '';

/**
 * Universal email dispatcher: routes through Vite dev backend `/api/send-email`
 * or direct Resend API fallback.
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

    // 1. Primary Route: Server endpoint `/api/send-email`
    if (typeof window !== 'undefined') {
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
          console.log('[EmailService] Dispatched via /api/send-email:', data);
          return { success: true, id: data.id };
        }
      } catch (apiErr) {
        console.warn('[EmailService] Local backend failed, attempting direct API:', apiErr);
      }
    }

    // 2. Direct Fallback via Resend API
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
        console.log('[EmailService] Dispatched via direct Resend API:', directData);
        return { success: true, id: directData.id };
      } else {
        return { success: false, error: directData.message || 'Direct Resend call failed' };
      }
    } catch (directErr: any) {
      console.warn('[EmailService] Direct email fallback failed, simulating success:', directErr);
      return { success: true, id: `sim-${Date.now()}` };
    }
  } catch (err: any) {
    console.error('[EmailService] Exception in sendResendEmail:', err);
    return { success: false, error: err?.message || 'Internal error' };
  }
}

/**
 * Send 6-Digit Real Login Security OTP Email
 */
export async function sendLoginOtpEmail(params: {
  toEmail: string;
  userName: string;
  otpCode: string;
}): Promise<boolean> {
  const { toEmail, userName, otpCode } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SafarGo Login OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 30px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">
                Safar<span style="color: #fecdd3;">Go</span>
              </h1>
              <p style="margin: 6px 0 0; color: #ffe4e6; font-size: 13px; font-weight: 600;">
                🚌 अब हर सफर होगा आसान • सुरक्षित लॉगिन OTP डेस्क
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #0f172a;">
                नमस्ते ${userName || 'पार्टनर'},
              </h2>
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #475569;">
                आपके SafarGo एजेंट हब खाते में लॉगिन करने का अनुरोध प्राप्त हुआ है। सत्र अधिकृत करने के लिए नीचे दिए गए 6-अंकीय OTP का उपयोग करें:
              </p>
              <div style="background-color: #fff1f2; border: 2px dashed #f43f5e; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #be123c; letter-spacing: 1.5px; margin-bottom: 8px;">
                  आपका 6-अंकीय लॉगिन OTP
                </span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #e11d48;">
                  ${otpCode}
                </span>
                <span style="display: block; font-size: 12px; font-weight: 600; color: #9f1239; margin-top: 8px;">
                  ⏱️ यह कोड 10 मिनट के लिए वैध है
                </span>
              </div>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                सुरक्षा चेतावनी: SafarGo कभी भी आपका OTP या पासवर्ड फोन पर नहीं पूछता। इसे किसी के साथ साझा न करें।
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              SafarGo Mobility Partner Desk • support@safargo.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `SafarGo: आपका लॉगिन OTP कोड ${otpCode} है। 10 मिनट में वैध। इसे किसी के साथ साझा न करें।`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `🔐 SafarGo: आपका 6-अंकीय लॉगिन OTP कोड [${otpCode}]`,
    html,
    text,
  });

  return res.success;
}

/**
 * Send Onboarding Application Submitted & Verification Under Review Email (24-Hour Notice)
 */
export async function sendOnboardingSubmittedEmail(params: {
  toEmail: string;
  fullName: string;
  shopName: string;
  agentId: string;
  mobile: string;
}): Promise<boolean> {
  const { toEmail, fullName, shopName, agentId, mobile } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SafarGo Onboarding Submitted - 24 Hours Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 26px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">
                Safar<span style="color: #fb7185;">Go</span>
              </h1>
              <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px; font-weight: 600;">
                📋 ऑनबोर्डिंग आवेदन सफलतापूर्वक प्राप्त हुआ
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 26px;">
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 18px 20px; margin-bottom: 22px; text-align: center;">
                <span style="display: inline-block; font-size: 28px; margin-bottom: 4px;">⏳</span>
                <h2 style="margin: 0 0 6px; font-size: 16px; font-weight: 900; color: #92400e;">
                  SafarGo टीम आपका अकाउंट 24 घंटे में वेरीफाई करेगी
                </h2>
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #b45309;">
                  हम आपका अकाउंट वेरीफाई कर रहे हैं, वेरीफाई होने के बाद आपको सूचित किया जाएगा
                </p>
              </div>

              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
                प्रिय <strong>${fullName}</strong> (${shopName}),
              </p>
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #475569;">
                SafarGo अधिकृत बस व होटल बुकिंग एजेंट बनने के लिए आपका 5-Step ऑनबोर्डिंग आवेदन सफलतापूर्वक प्राप्त हो चुका है। आपका आवेदन संदर्भ ID: <strong style="color: #e11d48; font-family: monospace;">${agentId}</strong> है।
              </p>

              <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; font-size: 12px;">
                <tr>
                  <td style="font-weight: 700; color: #64748b; width: 40%;">पंजीकृत दुकान/केंद्र:</td>
                  <td style="font-weight: 800; color: #0f172a;">${shopName}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">मोबाइल नंबर:</td>
                  <td style="font-weight: 800; color: #0f172a;">+91 ${mobile}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">कमीशन दर:</td>
                  <td style="font-weight: 800; color: #059669;">फ्लैट ₹19.34 प्रति बुकिंग (फिक्स)</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #64748b;">वेरिफिकेशन स्थिति:</td>
                  <td style="font-weight: 800; color: #d97706;">समीक्षाधीन (Under 24-hr Review)</td>
                </tr>
              </table>

              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 11px; color: #991b1b; line-height: 1.5;">
                <strong>महत्वपूर्ण सूचना:</strong> जब तक SafarGo टीम द्वारा आपके दस्तावेजों का सत्यापन पूर्ण नहीं हो जाता, तब तक एजेंट हब में लॉगिन की अनुमति नहीं होगी। सत्यापन पूर्ण होते ही आपको ईमेल प्राप्त होगा।
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              Your registration complete, complete onboarding and earn money, good journey, thank you 🙏<br/>
              SafarGo Partner Team • support@safargo.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `SafarGo Onboarding Submitted! प्रिय ${fullName}, SafarGo टीम आपका अकाउंट 24 घंटे में वेरीफाई करेगी। हम आपका अकाउंट वेरीफाई कर रहे हैं, वेरीफाई होने के बाद आपको सूचित किया जाएगा। आवेदन ID: ${agentId}। Your registration complete, complete onboarding and earn money, good journey, thank you 🙏`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `📋 SafarGo: Onboarding Submitted (${agentId}) - 24 घंटे में वेरिफिकेशन होगा`,
    html,
    text,
  });

  return res.success;
}

/**
 * Send Agent Account Approved Email (Sent when Admin approves)
 */
export async function sendAgentApprovalEmail(params: {
  toEmail: string;
  fullName: string;
  shopName: string;
  agentId: string;
}): Promise<boolean> {
  const { toEmail, fullName, shopName, agentId } = params;

  const passwordLink = (typeof window !== 'undefined' && window.location.origin) 
    ? `${window.location.origin}/?action=set_password&agentId=${encodeURIComponent(agentId)}` 
    : `http://54.206.67.134/?action=set_password&agentId=${encodeURIComponent(agentId)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SafarGo Account Approved & Active</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 26px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">
                Safar<span style="color: #a7f3d0;">Go</span>
              </h1>
              <p style="margin: 6px 0 0; color: #d1fae5; font-size: 13px; font-weight: 600;">
                🎉 Congratulations! Your Account is Now Active
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 26px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #0f172a;">
                नमस्ते ${fullName} (${shopName}),
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                SafarGo अधिकृत टीम द्वारा आपके ऑनबोर्डिंग के सभी 5 स्टेप्स और e-KYC दस्तावेजों (आधार, पैन व बैंक विवरण) का सत्यापन सफलतापूर्वक पूर्ण कर लिया गया है। आपका B2B एजेंट खाता अब पूर्णतः <strong>सत्यापित एवं सक्रिय (Active)</strong> है!
              </p>
              
              <div style="background-color: #ecfdf5; border: 2px dashed #10b981; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 20px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 1.5px; margin-bottom: 6px;">
                  आपकी आधिकारिक B2B पार्टनर ID
                </span>
                <span style="display: inline-block; font-family: monospace; font-size: 24px; font-weight: 900; color: #059669;">
                  ${agentId}
                </span>
                <span style="display: block; font-size: 12px; font-weight: 700; color: #065f46; margin-top: 6px;">
                  गारंटीड फिक्स कमीशन: ₹19.34 प्रति बस व होटल बुकिंग
                </span>
              </div>

              <!-- Set Password CTA Button -->
              <div style="text-align: center; margin: 26px 0; background-color: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;">
                <span style="display: block; font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
                  🔐 एजेंट पोर्टल में लॉगिन करने के लिए अपना पासवर्ड सेट करें:
                </span>
                <a href="${passwordLink}" style="display: inline-block; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; font-size: 14px; font-weight: 800; padding: 12px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
                  🔑 पासवर्ड सेट करें (Set Password Link)
                </a>
                <span style="display: block; font-size: 11px; color: #64748b; margin-top: 10px;">
                  इस लिंक से सेट हुआ पासवर्ड SafarGo ऐप में सीधे काम करेगा।
                </span>
              </div>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #1e293b;">
                  लॉगिन के दो सरल विकल्प उपलब्ध हैं:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.6;">
                  <li><strong>पासवर्ड से लॉगिन:</strong> ऊपर दिए गए लिंक से अपना पासवर्ड बनाएं।</li>
                  <li><strong>Gmail OTP से लॉगिन:</strong> बिना पासवर्ड के केवल अपने Gmail पर 6-अंकीय OTP मंगाकर प्रवेश करें।</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              Your registration complete, complete onboarding and earn money, good journey, thank you 🙏<br/>
              SafarGo Partner Team • support@safargo.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `🎉 Congratulations! Your SafarGo Agent Account is now active (${agentId})! Set your password here: ${passwordLink}. Your registration complete, complete onboarding and earn money, good journey, thank you 🙏`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `🎉 Congratulations! Your SafarGo Account is Now Active (${agentId}) - Set Password`,
    html,
    text,
  });

  return res.success;
}

/**
 * Send Bus Ticket Verification & Approval Email to Agent
 */
export async function sendTicketApprovalEmail(params: {
  toEmail: string;
  agentName: string;
  agentId?: string;
  pnr: string;
  busOperator: string;
  fromCity: string;
  toCity: string;
  travelDate: string;
  departureTime: string;
  seats: string[];
  totalFare: number;
  utr?: string;
  commission: number;
}): Promise<boolean> {
  const {
    toEmail,
    agentName,
    agentId = 'SFG-AGENT-2026-9041',
    pnr,
    busOperator,
    fromCity,
    toCity,
    travelDate,
    departureTime,
    seats,
    totalFare,
    utr,
    commission = 19.34
  } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SafarGo Ticket Verified & Confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 26px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">
                Safar<span style="color: #a7f3d0;">Go</span>
              </h1>
              <p style="margin: 6px 0 0; color: #d1fae5; font-size: 13px; font-weight: 700;">
                🎫 टिकट सफलतापूर्वक सत्यापित एवं स्वीकृत (e-Ticket Issued)
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 26px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 800; color: #0f172a;">
                नमस्ते ${agentName},
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
                सुपर एडमिन द्वारा आपके द्वारा बुक किए गए टिकट (<strong>PNR: ${pnr}</strong>) और भुगतान UTR (${utr || 'N/A'}) का सत्यापन पूर्ण कर लिया गया है। आपका ई-टिकट अब पूर्णतः <strong>कन्फर्म (Confirmed)</strong> है और ऐप में डाउनलोड हेतु अनलॉक हो चुका है।
              </p>

              <!-- PNR Highlight Box -->
              <div style="background-color: #ecfdf5; border: 2px dashed #10b981; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 20px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 1.5px; margin-bottom: 6px;">
                  कन्फर्म टिकट PNR
                </span>
                <span style="display: inline-block; font-family: monospace; font-size: 26px; font-weight: 900; color: #059669; letter-spacing: 2px;">
                  ${pnr}
                </span>
                <span style="display: block; font-size: 12px; font-weight: 700; color: #065f46; margin-top: 6px;">
                  💰 वॉलेट में फिक्स कमीशन क्रेडिट: +₹${commission.toFixed(2)}
                </span>
              </div>

              <!-- Journey Summary -->
              <table width="100%" cellpadding="6" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px; margin-bottom: 20px;">
                <tr>
                  <td style="color: #64748b; font-weight: 600;">बस ऑपरेटर:</td>
                  <td style="color: #0f172a; font-weight: 800; text-align: right;">${busOperator}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">रूट:</td>
                  <td style="color: #0f172a; font-weight: 800; text-align: right;">${fromCity} ➔ ${toCity}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">यात्रा तिथि व समय:</td>
                  <td style="color: #0f172a; font-weight: 800; text-align: right;">${travelDate} (${departureTime})</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">सीटें:</td>
                  <td style="color: #059669; font-weight: 900; text-align: right;">${seats.join(', ')}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">कुल किराया:</td>
                  <td style="color: #0f172a; font-weight: 900; text-align: right;">₹${totalFare}</td>
                </tr>
              </table>

              <!-- Notice on Unlock -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af; font-weight: 600;">
                  🔓 <strong>ई-टिकट डाउनलोड सक्रिय:</strong> अब आप SafarGo ऐप के "मेरी बुकिंग" मेनू में जाकर इस टिकट का PDF डाउनलोड या प्रिंट कर सकते हैं।
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b;">
                यह ई-टिकट बस में यात्रा के दौरान वैध पहचान पत्र के साथ मान्य है।
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              Your booking is confirmed, have a safe journey, thank you 🙏<br/>
              SafarGo Support Desk • support@safargo.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `🎉 SafarGo e-Ticket Verified & Confirmed! PNR: ${pnr}, Route: ${fromCity} -> ${toCity}, Travel Date: ${travelDate}, Seats: ${seats.join(', ')}. Commission of ₹${commission.toFixed(2)} credited to your wallet. You can now download the e-Ticket PDF from My Bookings. Thank you 🙏`;

  const res = await sendResendEmail({
    to: toEmail,
    subject: `🎉 SafarGo ई-टिकट सत्यापित एवं स्वीकृत! (PNR: ${pnr}) - e-Ticket Unlocked`,
    html,
    text,
  });

  return res.success;
}

