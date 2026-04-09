const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Terms of Service for Meetrix</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: April 9, 2026</p>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              By accessing or using Meetrix (https://meetrix.anushreesh.com), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">2. Description of Service</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Meetrix is a group scheduling tool that integrates with your Google Calendar to facilitate finding common meeting times, scheduling events, and generating video conferencing links.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">3. Accounts and Authentication</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              To use Meetrix, you must authenticate using your Google Account. You are responsible for safeguarding the password or credentials you use to access Google and for any activities or actions under your account. We are not liable for any loss or damage arising from your failure to secure your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">4. User Conduct</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Schedule illegal, harmful, or abusive events.</li>
              <li>Interfere with or disrupt the security, integrity, or performance of the Service.</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">5. Third-Party Services (Google)</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Our Service relies heavily on Google APIs (specifically Google Calendar). Your use of these integrations is also governed by Google's Terms of Service. We are not responsible for the availability or reliability of Google's services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">6. Limitation of Liability</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              In no event shall Meetrix, its developers, or its affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">7. Changes to Terms</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by updating the "Effective Date" at the top of these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">8. Contact Information</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have any questions about these Terms, please contact us at:{" "}
              <a href="mailto:ashree2118@gmail.com" className="text-primary hover:underline">
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
