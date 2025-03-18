import { send } from "mail/provider";
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  try {
    await send({
      to: "test@example.com",
      subject: "Test Email",
      text: "This is a test email from your Nuxt application.",
      html: "<h1>Test Email</h1><p>This is a test email from your Nuxt application.</p>",
    });
    
    return { success: true, message: "Test email sent successfully" };
  } catch (error) {
    console.error("Failed to send test email:", error);
    return { success: false, error: String(error) };
  }
}); 