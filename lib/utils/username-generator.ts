import { customAlphabet } from "nanoid";
import db from "@/lib/db";

const ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789_";
const MAX_USERNAME_LENGTH = 30;
const MIN_USERNAME_LENGTH = 3;

export async function generateUniqueUsername(email: string): Promise<string> {
  // Create safe base username
  const baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, MAX_USERNAME_LENGTH - 10); // Leave room for random suffix

  if (baseUsername.length < MIN_USERNAME_LENGTH) {
    throw new Error("Email prefix too short for username generation");
  }

  // Generate random suffix
  const nanoid = customAlphabet(ALLOWED_CHARS, 6);

  // Try up to 5 times to generate a unique username
  for (let i = 0; i < 5; i++) {
    const username = `${baseUsername}_${nanoid()}`;

    const exists = await db.user.findUnique({
      where: { username },
      select: { username: true },
    });

    if (!exists) return username;
  }

  throw new Error("Could not generate unique username");
}
