import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
import nodemailer from "nodemailer";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

// HTTP Function Example
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

// Firestore Trigger Example: Send an email when a new document is created in 'queue/{queueId}'
export const sendQueueEmail = onDocumentCreated("queue/{queueId}", async (event) => {
  const data = event.data;

  // Ensure the data contains required fields
  if (!data || !data.email || !data.name || !data.queueNumber) {
    logger.error("Missing required fields in Firestore document.", { data });
    return;
  }

  // Nodemailer transporter setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kylayoong77@gmail.com", // Replace with your Gmail address
      pass: "itskyla730",        // Replace with your Gmail app password
    },
  });

  // Email options
  const mailOptions = {
    from: "kylayoong77@gmail.com", // Replace with your Gmail address
    to: data.email,
    subject: "Queue Number",
    text: `Hello ${data.name}, your queue number is ${data.queueNumber}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully.", { email: data.email });
  } catch (error) {
    logger.error("Error sending email.", { error });
  }
});
