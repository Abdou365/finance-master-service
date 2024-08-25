import { readFileSync } from 'fs';

export const jwtSecretsPublic = {
  access_token: readFileSync('./keys/accessKey.pub', 'utf8'),
  refresh_token: readFileSync('./keys/refreshKey.pub', 'utf8'),
  confirm_token: readFileSync('./keys/confirmKey.pub', 'utf8'),
  recovery_token: readFileSync('./keys/recoveryKey.pub', 'utf8'),
};

export const jwtSecretsPrivate = {
  access_token: readFileSync('./keys/accessKey.pem', 'utf8'),
  refresh_token: readFileSync('./keys/refreshKey.pem', 'utf8'),
  confirm_token: readFileSync('./keys/confirmKey.pem', 'utf8'),
  recovery_token: readFileSync('./keys/recoveryKey.pem', 'utf8'),
};

export const jwtExpiresIn = {
  acces_token: '15m',
  confirm_token: '10m',
  recovery_token: '10m',
  refresh_token: '1d',
};

/**
 * Compute the expiration time in seconds based on a string input.
 * @param {string} expiresIn - The expiration time as a string (e.g., "10s", "5m", "2h", "1d").
 * @returns {number} - The expiration time in seconds.
 * @throws {Error} - If the input format is invalid.
 */
export const computeExpiresIn = (expiresIn: string): number => {
  const expiresInArray = expiresIn.match(/(\d+)(\w+)/);
  if (!expiresInArray) {
    throw new Error(
      "Invalid format. Expected format: <number><unit> (e.g., '10s', '5m')."
    );
  }
  const [_, value, unit] = expiresInArray;
  const unitMap: Record<string, number> = {
    s: 1,
    m: 60,
    min: 60, // Adding minutes
    h: 3600,
    d: 86400,
    w: 604800, // Adding weeks
    mo: 2592000, // Adding months
    y: 31536000, // Adding years
  };

  if (!unitMap[unit]) {
    throw new Error(
      `Invalid unit '${unit}'. Allowed units: s, m, h, d, w, mo.`
    );
  }

  return Number(value) * unitMap[unit] * 1000;
};

/**
 * Converts a time in seconds to a string with an appropriate unit.
 * @param {number} seconds - The time in seconds.
 * @returns {string} - The time as a string with an appropriate unit (e.g., "10s", "5m", "2h", "1d").
 */
export const convertSecondsToTimeUnit = (seconds: number): string => {
  const unitMap = [
    { unit: 'y', value: 31536000 },
    { unit: 'mo', value: 2592000 },
    { unit: 'w', value: 604800 },
    { unit: 'd', value: 86400 },
    { unit: 'h', value: 3600 },
    { unit: 'm', value: 60 },
    { unit: 's', value: 1 },
  ];

  for (const { unit, value } of unitMap) {
    if (seconds >= value) {
      const time = Math.floor(seconds / value);
      return `${time}${unit}`;
    }
  }

  return '0s'; // Return "0s" if the input is less than 1 second
};

/**
 * Computes the date by adding the specified number of seconds to the current date.
 * @param value - The number of seconds to add to the current date.
 * @returns The computed date.
 */
export const computeDate = (value: number) => {
  return new Date(Date.now() + value * 1000);
};

export const jwtCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // sameSite: 'strict',
  maxAge: computeExpiresIn('1min'), // 7 days
  signed: true,
};
