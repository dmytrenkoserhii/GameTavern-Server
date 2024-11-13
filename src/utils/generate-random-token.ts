import { randomBytes } from 'crypto';

export const generateRandomToken = (length = 20, to: BufferEncoding = 'hex'): string => {
  return randomBytes(length).toString(to);
};
