export const sendMeetingConfirmation = async (meeting, host, guests) => {
  try {
    const startDate = new Date(meeting.finalStartTime).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    const startTime = new Date(meeting.finalStartTime).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
    const endTime = new Date(meeting.finalEndTime).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });

    // Generate Universal Google Calendar Link
    const formatGoogleDate = (date) => new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const googleStart = formatGoogleDate(meeting.finalStartTime);
    const googleEnd = formatGoogleDate(meeting.finalEndTime);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${googleStart}/${googleEnd}&details=${encodeURIComponent(meeting.description || 'Scheduled via Meetrix')}`;

    const guestListHtml = guests
      .map(g => `<li>${g.name} ${g.email ? `(${g.email})` : ''}</li>`)
      .join('');

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #0f172a;">Your Meeting is Confirmed! 🎉</h2>
        <p>The time has been finalized for <strong>${meeting.title}</strong>.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Date:</strong> ${startDate}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime} (${meeting.durationMinutes} mins)</p>
          <p><strong>Host:</strong> ${host.name}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${googleCalendarUrl}" target="_blank" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            📅 Add to Google Calendar
          </a>
        </div>

        <h3>Attendees:</h3>
        <ul>${guestListHtml}</ul>
      </div>
    `;

    const validRecipients = [
      { email: host.email, name: host.name },
      ...guests.filter(g => g.email).map(g => ({ email: g.email, name: g.name }))
    ];

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL },
        to: validRecipients,
        subject: `Confirmed: ${meeting.title} on ${startDate}`,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
    }

    console.log(`✅ Confirmation email sent successfully to ${validRecipients.length} participants.`);
  } catch (error) {
    console.error("❌ Email failed to send:", error.message);
  }
};