import express from "express";
//import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/kakao/sign-in", async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KAKAO_ID,
    redirect_uri: "http://localhost:3000/api/kakao/userInfo",
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();

  const finalUrl = `${baseUrl}?${params}`;
  console.log(finalUrl);
  return res.redirect(finalUrl);
});

router.get("/kakao/userInfo", async (req, res, next) => {
  try {
    const baseUrl = "https://kauth.kakao.com/oauth/token";
    const config = {
      client_id: process.env.KAKAO_ID,
      client_secret: process.env.KAKAO_SECRET,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000/api/kakao/userInfo",
      code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const kakaoTokenRequest = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    const kakaoTokenData = await kakaoTokenRequest.json();

    if ("access_token" in kakaoTokenData) {
      const { access_token } = kakaoTokenData;
      const userRequest = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-type": "application/json",
        },
      });
      const userData = await userRequest.json();
      const user = await prisma.users.findFirst({
        where: { email: userData.kakao_account.email },
      });
      if (!user) {
        await prisma.users.create({
          data: {
            kakaoId: userData.id,
            name: userData.kakao_account.name,
            email: userData.kakao_account.email,
          },
        });
      }
      return res.json({ data: user });
    } else {
      // 엑세스 토큰이 없으면 로그인페이지로 리다이렉트
      return res.redirect("api/kakao/sign-in");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/kakao/sign-in", async (req, res, next) => {
  try {
    const { kakaoId } = req.body;
    const user = await prisma.users.findFirst({
      where: { kakaoId: +kakaoId },
    });

    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
    }

    // 엑세스 토큰과 리프레시 토큰 발급
    const accessToken = jwt.sign(
      { userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "12h",
      }
    );
    const refreshToken = jwt.sign(
      { userId: user.userId },
      process.env.REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    // 리프레시 토큰 저장
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.userId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    // 쿠키에 토큰 할당
    res.cookie("authorization", `Bearer ${accessToken}`);
    res.cookie("refreshToken", refreshToken);

    return res.status(200).json({ message: "로그인에 성공하셨습니다." });
  } catch (err) {
    next(err);
  }
});

export default router;
