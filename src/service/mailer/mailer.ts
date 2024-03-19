import { Logger } from "../../singleton/logger.js";
const log = Logger.getLogger().child({ from: "mailer" });

import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

import { Configuration } from "../../singleton/configuration.js";

const Modes = {
  PRINT: "print",
  SENDGRID: "sendgrid",
  NODEMAILER: "nodemailer",
};

interface Email {
  to: string;
  from?: {
    email: string;
    name: string;
  };
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData: any;
}

export class Mailer {
  mode = Modes.PRINT;
  transporter?: ReturnType<typeof nodemailer.createTransport>;
  adapter = Configuration.get("system.email-adapter");

  public initialize(app: any) {
    if (this.adapter === Modes.SENDGRID) {
      this.mode = Modes.SENDGRID;
      sgMail.setApiKey(Configuration.get("sendgrid.api-key") as string);
    } else if (this.adapter === Modes.NODEMAILER) {
      this.mode = Modes.NODEMAILER;
      this.transporter = nodemailer.createTransport({
        service: Configuration.get("nodemailer.service-name"),
        host: Configuration.get("nodemailer.host"),
        port: Configuration.get("nodemailer.port"),
        secure: Configuration.get("nodemailer.secure"),
        auth: {
          user: Configuration.get("nodemailer.username"),
          pass: Configuration.get("nodemailer.password"),
        },
        requireTLS: true,
        tls: {
          ciphers: Configuration.get("nodemailer.ciphers"),
          rejectUnauthorized: Configuration.get("nodemailer.reject-unauthorized"),
        },
      });
      this.transporter.verify(function (error: any) {
        if (error) {
          log.error("Verification failed");
          log.error(error);
        } else {
          log.info("Nodemailer is ready.");
        }
      });
    }
    log.info("Mailer initialized in %s mode. ", this.mode);
  }

  public async send(email: Email) {
    if (!email.from) {
      const name = Configuration.get("system.app-name") as string;
      const emailAddress =
        Configuration.get("email.outbound-address") || Configuration.get("sendgrid.outbound-email-address");
      email.from = { email: emailAddress, name };
    }
    if (this.mode === Modes.SENDGRID) {
      await sgMail.send(email as any);
    } else if (this.mode === Modes.NODEMAILER) {
      (email.from as any) = `${email.from.name} <${email.from.email}>`;
      await (this.transporter as ReturnType<typeof nodemailer.createTransport>).sendMail(email as any);
    } else {
      log.info("%o", email);
    }
  }
}
