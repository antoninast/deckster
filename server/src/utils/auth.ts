import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

/**
 * Middleware to authenticate JWT tokens from requests
 * Extracts token from body, query params, or Authorization header
 * Attaches decoded user data to request object if valid
 */
export const authenticateToken = ({ req }: any) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  // Extract token from Bearer authorization header
  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || "", {
      maxAge: "1h",
    });
    req.user = data;
  } catch (err) {
    console.log("Invalid token");
    throw new AuthenticationError("Invalid or expired token");
  }

  return req;
};

/**
 * Creates a JWT token for user authentication
 * Token expires in 2 hours and contains user credentials
 */
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey: any = process.env.JWT_SECRET_KEY;

  return jwt.sign({ data: payload }, secretKey, { expiresIn: "1h" });
};

/**
 * Hashes a password using bcrypt with salt rounds of 10
 * Used during user registration and password updates
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Custom GraphQL error class for authentication failures
 * Extends GraphQL error with UNAUTHENTICATED extension
 */
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ["UNAUTHENTICATED"]);
    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}
