export async function onRequestPost({ request, env }) {
  try {
    let body;
    try { body = await request.json(); }
    catch { return json({ success: false, error: 'Invalid request body' }, 400); }

    const { firstName, lastName, email, company, inquiryType, message } = body;
    if (!firstName || !lastName || !email)
      return json({ success: false, error: 'Missing required fields' }, 400);

    const html = `
      <h2 style="font-family:sans-serif">New Contact Form Submission</h2>
      <table style="font-family:sans-serif;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Name</td>
            <td>${esc(firstName)} ${esc(lastName)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Email</td>
            <td>${esc(email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Company</td>
            <td>${esc(company || '\u2014')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Interest</td>
            <td>${esc(inquiryType || '\u2014')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Message</td>
            <td style="white-space:pre-wrap">${esc(message || '\u2014')}</td></tr>
      </table>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'website@henry-intl.com',
        to: ['hello@henry-intl.com'],
        reply_to: email,
        subject: `New enquiry from ${firstName} ${lastName} \u2014 Henry International`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error', res.status, errText);
      return json({ success: false, error: 'Failed to send email' }, 502);
    }

    return json({ success: true }, 200);
  } catch (err) {
    console.error('Unexpected error', err);
    return json({ success: false, error: 'Internal server error' }, 500);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
