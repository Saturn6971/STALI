import { NextResponse } from 'next/server';

// Note: Resend disabled until API key is available.
// import { Resend } from 'resend';
// const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'ali.dadak@student.htldornbirn.at';
// const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Stali <noreply@stali.app>';

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  // Temporary fallback while email provider is unavailable.
  // Replace with Resend (or another provider) once API keys are set.
  console.log('[contact] message received', { name, email, subject, message });
  return NextResponse.json({
    ok: true,
    message:
      'Contact form received. Email sending is temporarily disabled until an API key is configured.'
  });
}
