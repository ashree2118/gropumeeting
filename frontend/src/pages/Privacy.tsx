const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Privacy Policy for Meetrix</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective Date: April 9, 2026</p>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Introduction</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Welcome to Meetrix ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (https://meetrix.anushreesh.com) and use our scheduling services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Information We Collect</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              When you use Meetrix, we collect information that you voluntarily provide to us, specifically through Google OAuth authentication:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Profile Information:</strong> Your name, email address, and profile picture.</li>
              <li><strong>Google Calendar Data:</strong> With your explicit permission, we request read and write access to your Google Calendar.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">How We Use Your Information</h2>
            <p className="text-base leading-relaxed text-muted-foreground mb-4">
              We use the information we collect to provide, maintain, and improve our services, specifically to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Authenticate your account and keep it secure.</li>
              <li>Read your calendar availability to help propose meeting times.</li>
              <li>Create calendar events and generate Google Meet links on your behalf.</li>
              <li>Send you essential service-related communications.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Google API Services User Data Policy</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Meetrix's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements. We do not use your Google Calendar data for advertising, nor do we sell it to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Data Security and Retention</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              We use administrative, technical, and physical security measures (such as encrypted AWS servers) to help protect your personal information. We retain your profile information only for as long as your account is active. You may revoke Meetrix's access to your Google account at any time via your Google Account Security settings, and you may request the deletion of your Meetrix account data by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Contact Us</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have questions or comments about this Privacy Policy, please contact us at:{" "}
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

export default Privacy;
