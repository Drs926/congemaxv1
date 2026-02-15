import jwt, { JwtPayload } from "jsonwebtoken";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

export const signJwt = (userId: string): string => {
  return jwt.sign({}, getSecret(), {
    algorithm: "HS256",
    expiresIn: "7d",
    subject: userId,
  });
};

export const verifyJwt = (token: string): { id: string } => {
  const decoded = jwt.verify(token, getSecret()) as JwtPayload | string;
  if (typeof decoded === "string" || !decoded.sub) {
    throw new Error("Invalid token");
  }
  return { id: String(decoded.sub) };
};
