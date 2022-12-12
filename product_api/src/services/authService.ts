import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export default class AuthService {
  generateTokenUser(user: Partial<User>) {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );
  }
}
