import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) throw new Error("토큰이 존재하지 않습니다.");

    const [tokenType, tokenValue] = authorization.split(" ");

    if (tokenType !== "Bearer")
      throw new Error("토큰 타입 Bearer 형식이 아닙니다.");

    if (!tokenValue) throw new Error("인증정보가 올바르지 않습니다.");

    const token = jwt.verify(tokenValue, process.env.ACCESS_TOKEN_SECRET_KEY);

    if (!token.userId) throw new Error("인증정보가 올바르지 않습니다.");

    const user = await prisma.users.findFirst({
      where: { userId: token.userId },
    });
    if (!user) {
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    // user 정보 담기
    res.user = user;

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
