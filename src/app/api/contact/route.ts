import { NextResponse } from 'next/server';
import * as brevo from '@getbrevo/brevo';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'ali.dadak@student.htldornbirn.at';
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || '9d6728001@smtp-brevo.com';
const FROM_NAME = process.env.BREVO_FROM_NAME || 'Stali';

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (!process.env.BREVO_API_KEY) {
    console.error('[contact] BREVO_API_KEY is not configured');
    return NextResponse.json(
      { error: 'Email service is not configured. Please contact support directly.' },
      { status: 500 }
    );
  }

  try {
    // Initialize Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Contact Form: ${subject}`;
    sendSmtpEmail.htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;
    sendSmtpEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
    sendSmtpEmail.to = [{ email: TO_EMAIL }];
    sendSmtpEmail.replyTo = { email: email, name: name };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('[contact] Email sent successfully:', data);
    return NextResponse.json({
      ok: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.'
    });
  } catch (err: any) {
    console.error('[contact] Brevo error:', err);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
