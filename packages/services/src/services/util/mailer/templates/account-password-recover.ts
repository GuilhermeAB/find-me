interface EmailData {
  email: string,
  nickname: string,
  code: string,
}

export default function passwordRecoverEmail({ email, nickname, code }: EmailData): string {
  return `
    <span>
      ${email} - ${nickname} - ${code}
    </span>
  `;
}
