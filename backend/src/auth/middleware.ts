import { FastifyReply, FastifyRequest } from "fastify";
import { verifyJwt } from "./jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
    };
  }
}

export const requireAuth = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    request.user = verifyJwt(token);
  } catch {
    reply.code(401).send({ error: "Unauthorized" });
  }
};
