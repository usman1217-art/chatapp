const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: subject,
      htmlContent: html,
      sender: {
        name: "Chat App",
        email: process.env.BREVO_SENDER_EMAIL || "no-reply@chatapp.com",
      },
      to: [{ email: to }],
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Brevo API Error:", error);
    throw error;
  }
};

module.exports = sendEmail;