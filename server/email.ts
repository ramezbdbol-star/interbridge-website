const ADMIN_EMAIL = 'Moda232320315@gmail.com';
const ADMIN_PHONE = '+86 15325467680';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  interestedIn: string;
  message: string;
}

export async function sendContactNotification(data: ContactFormData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log('Email notification skipped: RESEND_API_KEY not configured');
    console.log('New contact request received:', data);
    return false;
  }

  try {
    const serviceLabels: Record<string, string> = {
      'sourcing': 'Sourcing & Screening',
      'oem': 'OEM/ODM Project',
      'interpretation': 'Interpretation/Visit',
      'qc': 'Quality Control Only',
      'other': 'Other'
    };

    const interestedLabel = serviceLabels[data.interestedIn] || data.interestedIn;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">New Contact Request</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">InterBridge Trans & Trade</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e3a5f; margin-top: 0;">Contact Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 140px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${data.firstName} ${data.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Interested In:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${interestedLabel}</td>
            </tr>
          </table>
          
          <h3 style="color: #1e3a5f; margin-top: 25px;">Message</h3>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
        
        <div style="background: #1e3a5f; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from your InterBridge website.</p>
        </div>
      </div>
    `;

    const emailText = `
New Contact Request - InterBridge Trans & Trade

Contact Details:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.email}
- Interested In: ${interestedLabel}

Message:
${data.message}

---
This is an automated notification from your InterBridge website.
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'InterBridge <onboarding@resend.dev>',
        to: ADMIN_EMAIL,
        subject: `New Inquiry from ${data.firstName} ${data.lastName} - InterBridge`,
        html: emailHtml,
        text: emailText,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    console.log('Email notification sent successfully to', ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

export { ADMIN_EMAIL, ADMIN_PHONE };
