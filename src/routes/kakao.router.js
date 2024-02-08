import express from "express";
import { prisma } from "../utils/prisma/index.js";
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
  return res.redirect(finalUrl);
});

router.get("/kakao/userInfo", async (req, res, next) => {
  try {
    const baseUrl = "https://kauth.kakao.com/oauth/token";
    const config = {
      client_id: process.env.KAKAO_ID, //restAPI 키
      client_secret: process.env.KAKAO_SECRET, //보안 키
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000/api/kakao/userInfo",
      code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    console.log(finalUrl);
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
      // 카카오 로그인을 하지 않고 일반 가입한 사용자가 이메일이 같으면 오류코드를 띄워준다.
      if (user && !user.kakaoId) {
        return res.status(401).json({ message: "이미 가입한 이메일입니다." });
      }
      if (!user) {
        await prisma.users.create({
          data: {
            kakaoId: userData.id,
            name: userData.kakao_account.name,
            email: userData.kakao_account.email,
            gender: userData.kakao_account.gender,
          },
        });
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

      // 쿠키에 토큰 할당
      res.cookie("authorization", `Bearer ${accessToken}`);
      res.cookie("refreshToken", refreshToken);

      // 유저 정보와 성공메시지를 반환
      return res.json({ data: user, message: "로그인에 성공하셨습니다." });
    } else {
      // 엑세스 토큰이 없으면 로그인페이지로 리다이렉트
      return res.redirect("/api/kakao/sign-in");
    }
  } catch (error) {
    next(error);
  }
});

export default router;
