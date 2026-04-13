import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Privacy Policy for Meetrix</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: April 9, 2026</p>

        <section className="space-y-10">
          {/* 1. Introduction */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">1. Introduction</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Welcome to Meetrix ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (https://meetrix.anushreesh.com) and use our scheduling services. We are committed to protecting your personal information and your right to privacy.
            </p>
          </div>

          {/* 2. Information We Collect (Explicitly naming the scopes) */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">2. Information We Collect</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              Meetrix requires specific permissions to function properly. When you authenticate using Google OAuth, we collect only the information strictly necessary to provide our scheduling service:
            </p>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground ml-4">
              <li>
                <strong>Basic Profile Information:</strong> We request access to your primary Google account email address (<code>.../auth/userinfo.email</code>) and basic profile info (<code>.../auth/userinfo.profile</code>) to create and securely authenticate your Meetrix account.
              </li>
              <li>
                <strong>Google Calendar Events Data:</strong> With your explicit consent, we request restricted access to view and edit events on your Google calendars (<code>.../auth/calendar.events</code>). This is required to read your availability and automatically schedule group meetings on your behalf.
              </li>
            </ul>
          </div>

          {/* 3. How We Use Your Information (Tying data directly to features) */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              We process your data exclusively to operate the Meetrix application. Specifically, your data is used to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Analyze your existing calendar events to calculate your free/busy times, preventing double-booking when proposing meeting dates.</li>
              <li>Automatically create and write finalized meeting events to your Google Calendar.</li>
              <li>Generate and attach Google Meet video conferencing links to scheduled events.</li>
              <li>Maintain the security and functionality of your Meetrix account.</li>
            </ul>
          </div>

          {/* 4. Google API Services Limited Use Disclosure (The "Magic Words" section) */}
          <div className="bg-muted p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-display font-bold mb-4">4. Google API Services Limited Use Disclosure</h2>
            <p className="text-base leading-relaxed text-foreground font-medium mb-2">
              Meetrix's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              To comply with the Limited Use requirements, we explicitly state that:
              <br />• We strictly limit the use of Google user data to providing or improving our user-facing scheduling features.
              <br />• We do not allow humans to read your data unless we have your affirmative agreement for specific troubleshooting purposes, or doing so is necessary for security purposes, to comply with applicable law, or for the app's internal operations (where data has been aggregated and anonymized).
            </p>
          </div>

          {/* 5. Data Sharing and Disclosure (Addressing the rejection explicitly) */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">5. Data Sharing, Transfer, and Disclosure</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              <strong>We do not sell, trade, rent, or otherwise share, transfer, or disclose your Google user data (including profile information and Google Calendar data) to any third parties, affiliates, or advertising platforms.</strong> Furthermore, your data is never transferred to or used to train generalized Artificial Intelligence (AI) or Machine Learning (ML) models. Your data remains strictly confined to the Meetrix application environment to facilitate your personal scheduling requests.
            </p>
          </div>

          {/* 6. Data Security and Retention */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">6. Data Security, Retention, and Deletion</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              <strong>Security:</strong> We implement industry-standard administrative, technical, and physical security measures (including encryption in transit via HTTPS and encrypted AWS server environments) to protect your personal information from unauthorized access.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              <strong>Retention:</strong> We retain your profile information only for as long as your Meetrix account is active. Calendar event data is processed in real-time and is not permanently stored on our database beyond the scope of active meeting proposals.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              <strong>Data Deletion & Revocation:</strong> You may request the complete deletion of your Meetrix account and associated data by contacting us at the email below. Additionally, you may revoke Meetrix's access to your Google account at any time by visiting your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Account Security Settings</a>.
            </p>
          </div>

          {/* 7. Contact Us */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">7. Contact Us</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have questions, comments, or data deletion requests regarding this Privacy Policy, please contact our Data Protection Officer at:{" "}
              <a href="mailto:ashree2118@gmail.com" className="text-primary hover:underline font-medium">
                ashree2118@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;