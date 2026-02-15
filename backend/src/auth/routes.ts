import { FastifyPluginAsync } from "fastify";
import { getDb } from "../db/client.js";
import { signJwt } from "./jwt.js";
import { hashPassword, verifyPassword } from "./password.js";

type AuthBody = {
  email?: string;
  password?: string;
};

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: AuthBody }>("/auth/signup", async (request, reply) => {
    const { email, password } = request.body ?? {};
    if (!email || !password || !isValidEmail(email) || password.length < 8) {
      return reply.code(400).send({ error: "Invalid input" });
    }

    const db = getDb();
    const hashed = await hashPassword(password);

    try {
      const result = await db.query<{ id: string; email: string }>(
        "insert into users(email, password_hash) values ($1, $2) returning id, email",
        [email.toLowerCase(), hashed],
      );
      return reply.code(201).send(result.rows[0]);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "23505") {
        return reply.code(409).send({ error: "Email already exists" });
      }
      throw error;
    }
  });

  fastify.post<{ Body: AuthBody }>("/auth/login", async (request, reply) => {
    const { email, password } = request.body ?? {};
    if (!email || !password) {
      return reply.code(400).send({ error: "Invalid credentials" });
    }

    const db = getDb();
    const result = await db.query<{ id: string; password_hash: string }>(
      "select id, password_hash from users where email = $1",
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    return { token: signJwt(user.id) };
  });
};
