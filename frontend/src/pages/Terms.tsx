import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: April 9, 2026</p>

        <section className="space-y-10">
          {/* 1. Agreement to Terms */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              By accessing or using Meetrix (https://meetrix.anushreesh.com), you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not access the service. These terms apply to all visitors, users, and others who access or use Meetrix.
            </p>
          </div>

          {/* 2. Description of Service */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">2. Description of Service</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Meetrix is a web-based group scheduling application designed to streamline the process of finding common meeting times. The service integrates directly with your connected calendar to read availability, propose meeting times, and automatically generate scheduled events and video conferencing links upon group consensus.
            </p>
          </div>

          {/* 3. Accounts and Google Authentication */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">3. Accounts and Authentication</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              To use the core features of Meetrix, you must authenticate using a valid Google Account. By doing so:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>You authorize us to access specific information and perform actions on your behalf as outlined in our Privacy Policy and authorized via the Google OAuth consent screen.</li>
              <li>You are responsible for safeguarding the password and security credentials of your Google Account.</li>
              <li>We are not liable for any loss or damage arising from unauthorized access to your account due to your failure to secure your credentials.</li>
            </ul>
          </div>

          {/* 4. Third-Party Services and Google Integration (Important for Reviewers) */}
          <div className="bg-muted p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-display font-bold mb-4">4. Third-Party Services (Google APIs)</h2>
            <p className="text-base leading-relaxed text-foreground font-medium mb-2">
              Meetrix relies heavily on integrations with Google APIs, specifically the Google Calendar API.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              Your use of these integrations is governed not only by these Terms but also by <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Terms of Service</a>. Meetrix is not responsible for the availability, uptime, accuracy, or reliability of Google's services. If Google experiences an outage or changes its API structure, Meetrix's scheduling functionality may be temporarily degraded or suspended.
            </p>
          </div>

          {/* 5. User Conduct */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">5. Acceptable Use and Conduct</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Schedule, promote, or organize illegal, harmful, or abusive events.</li>
              <li>Interfere with, disrupt, or attempt to gain unauthorized access to the Service, its servers, or associated networks.</li>
              <li>Use the Service to transmit spam, unsolicited communications, or malicious software.</li>
              <li>Reverse engineer or attempt to extract the source code of the application.</li>
            </ul>
          </div>

          {/* 6. Termination and Revocation */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">6. Termination</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. You may terminate your use of the Service at any time by ceasing to visit the website and revoking Meetrix's access to your Google Account via your Google security settings.
            </p>
          </div>

          {/* 7. Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">7. Limitation of Liability and Disclaimers</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              <strong>"As Is" Basis:</strong> The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Meetrix makes no warranties, expressed or implied, regarding the continuous availability or error-free nature of the platform.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              <strong>Liability:</strong> In no event shall Meetrix, its developers, or its affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, missed meetings, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </div>

          {/* 8. Contact Information */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">8. Contact Us</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have any questions, concerns, or technical issues regarding these Terms, please contact us at:{" "}
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

export default Terms;