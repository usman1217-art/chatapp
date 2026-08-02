const SibApiV3Sdk = require("@getbrevo/brevo");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiAccessorKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { 
      name: "Chat App", 
      email: process.env.BREVO_SENDER_EMAIL || "no-reply@chatapp.com" 
    };
    sendSmtpEmail.to = [{ email: to }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, data };
  } catch (error) {
    console.error("Brevo API Error:", error);
    throw error;
  }
};

module.exports = sendEmail;