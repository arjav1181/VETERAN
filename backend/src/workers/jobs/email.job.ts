import { emailService } from "../../services/email.service.js";
import { logger } from "../../utils/logger.js";

export async function processEmailJob(job: { data: Record<string, unknown> }): Promise<void> {
  const { to, subject, html, text } = job.data as {
    to: string;
    subject: string;
    html: string;
    text?: string;
  };

  logger.info("Sending email", { to, subject });

  await emailService.sendEmail(to, subject, html, text);
}
