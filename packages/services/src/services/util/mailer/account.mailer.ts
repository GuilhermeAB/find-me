import { Mailer } from '@find-me/mailer';
import passwordRecoverEmail from './templates/account-password-recover';
import verificationEmail from './templates/account-verification-email';

const VERIFICATION_EMAIL_SUBJECT = 'Verificar email';

export class AccountMailer {
  public static async sendVerificationEmail(email: string, nickname: string, code: string): Promise<void> {
    const mailer = new Mailer();

    const body = verificationEmail({
      email,
      nickname,
      code,
    });

    await mailer.sendEmail(email, VERIFICATION_EMAIL_SUBJECT, body);
  }

  public static async sendPasswordRecoverEmail(email: string, nickname: string, code: string): Promise<void> {
    const mailer = new Mailer();

    const body = passwordRecoverEmail({
      email,
      nickname,
      code,
    });

    await mailer.sendEmail(email, VERIFICATION_EMAIL_SUBJECT, body);
  }
}
