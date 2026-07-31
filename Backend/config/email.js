const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: "Usman Arif ua031860@gmail.com", // Or your verified domain
      to: [to],
      subject: subject,
      html: html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend API Error:", error);
    throw error;
  }
};

module.exports = sendEmail;