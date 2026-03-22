import 'dotenv/config';

export const sendMeetingConfirmation = async (meeting, host, guests) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("No Brevo API key found. Skipping email confirmation.");
    return;
  }

  const startDate = new Date(meeting.finalStartTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const startTime = new Date(meeting.finalStartTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(meeting.finalEndTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });


  const guestListHtml = guests.map(g => `<li>${g.name} ${g.email ? `(${g.email})` : ''}</li>`).join('');


  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #0f172a;">Your Meeting is Confirmed! 🎉</h2>
      <p>The time has been finalized for <strong>${meeting.title}</strong>.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${startDate}</p>
        <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${startTime} - ${endTime} (${meeting.durationMinutes} mins)</p>
        <p style="margin: 0 0 10px 0;"><strong>Host:</strong> ${host.name} (${host.email})</p>
        ${meeting.description ? `<p style="margin: 0;"><strong>Details:</strong> ${meeting.description}</p>` : ''}
      </div>

      <h3 style="color: #334155;">Attendees:</h3>
      <ul style="color: #475569;">
        ${guestListHtml}
      </ul>
    </div>
  `;

  const validGuestRecipients = guests
    .filter(g => g.email && g.email.trim() !== '')
    .map(g => ({ email: g.email, name: g.name }));
    
  const toRecipients = [
    { email: host.email, name: host.name },
    ...validGuestRecipients
  ];

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL
    },
    to: toRecipients,
    subject: `Confirmed: ${meeting.title} on ${startDate}`,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
    } else {
      console.log(`✅ Confirmation email sent successfully to ${toRecipients.length} participants.`);
    }
  } catch (error) {
    console.error("Network error while sending email:", error);
  }
};