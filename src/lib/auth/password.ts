import { compareSync } from "bcryptjs";

export const verifyPassword = (
  password: string,
  passwordHash: string,
): boolean => {
  try {
    return compareSync(password, passwordHash);
  } catch (error) {
    console.error("[auth/password] compare error:", error);
    return false;
  }
};