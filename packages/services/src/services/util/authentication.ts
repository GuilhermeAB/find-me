import { AccountEntity } from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { UUID } from '@find-me/uuid';
import { genSaltSync, hashSync } from 'bcrypt';
import { DateVO } from '@find-me/date';
import { sign } from 'jsonwebtoken';

export class Authentication {
  private static generateTokenId(accountId: string, hashToken: string): string {
    const prefix = accountId.substring(1, 4);
    const token = hashSync(`${prefix}${hashToken}`, genSaltSync(10));

    return token;
  }

  public static generateToken(account: AccountEntity): string {
    const {
      AUTHENTICATION_SECRET_TOKEN_HASH,
      AUTHENTICATION_SECRET_TOKEN_TIMEOUT = '8h',
    } = process.env;

    if (!AUTHENTICATION_SECRET_TOKEN_HASH) {
      console.log('=>>', AUTHENTICATION_SECRET_TOKEN_HASH);
      throw new ValidationError({ key: 'InvalidEnv' });
    }

    const {
      id,
      status,
      role,
      person,
    } = account.getProps();

    const token = sign(
      {
        accountId: id.value,
        personId: person instanceof UUID ? person.value : person.getProps().id.value,
        tokenId: Authentication.generateTokenId(id.value, AUTHENTICATION_SECRET_TOKEN_HASH),
        role,
        status,
        createdAt: DateVO.now().value,
      },
      AUTHENTICATION_SECRET_TOKEN_HASH,
      {
        algorithm: 'HS256',
        expiresIn: AUTHENTICATION_SECRET_TOKEN_TIMEOUT,
      },
    );

    return token;
  }
}
