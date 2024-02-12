import express from "express";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/** 카카오 로그인 */
router.get("/kakao/sign-up", async (req, res, next) => {
  try {
    const baseUrl = "https://kauth.kakao.com/oauth/authorize";
    const config = {
      client_id: process.env.KAKAO_ID,
      redirect_uri: process.env.KAKAO_REDIRECT,
      response_type: "code",
    };
    const params = new URLSearchParams(config).toString();

    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
  } catch (error) {
    next(error);
  }
});

router.get("/kakao/sign-in", async (req, res, next) => {
  try {
    const baseUrl = "https://kauth.kakao.com/oauth/token";
    const config = {
      client_id: process.env.KAKAO_ID, //restAPI 키
      client_secret: process.env.KAKAO_SECRET, //보안 키
      grant_type: "authorization_code",
      redirect_uri: process.env.KAKAO_REDIRECT,
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
    console.log(kakaoTokenData);

    if ("access_token" in kakaoTokenData) {
      const { access_token } = kakaoTokenData;
      const userRequest = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-type": "application/json",
        },
      });
      const userData = await userRequest.json();
      let user = await prisma.users.findFirst({
        where: { email: userData.kakao_account.email },
      });
      // 카카오 로그인을 하지 않고 일반 가입한 사용자가 이메일이 같으면 오류코드를 띄워준다.
      if (user && !user.kakaoId) {
        return res.status(400).json({ message: "이미 가입한 이메일입니다." });
      }

      const kakaoId = userData.id.toString();
      console.log(kakaoId);

      if (!user) {
        // user 없을 시 새로운 유저 생성
        const newUser = await prisma.users.create({
          data: {
            kakaoId: kakaoId,
            name: userData.kakao_account.name,
            email: userData.kakao_account.email,
            gender: userData.kakao_account.gender,
          },
        });
        user = newUser;
      }

      // 카카오에서 지급한 엑세스토큰과 리프레시토큰을 저장
      res.cookie("kakao_access_token", kakaoTokenData.access_token, {
        maxAge: kakaoTokenData.expires_in * 1000,
      });
      res.cookie("kakao_refresh_token", kakaoTokenData.refresh_token, {
        maxAge: kakaoTokenData.refresh_token_expires_in * 1000,
      });

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
      return res.json({ message: "로그인에 성공하셨습니다." });
    } else {
      // 엑세스 토큰이 없으면 로그인페이지로 리다이렉트
      return res.redirect("/api/kakao/sign-up");
    }
  } catch (error) {
    next(error);
  }
});

/** 카카오 로그아웃 */
router.get("/kakao/logout", async (req, res, next) => {
  const { kakao_access_token } = req.cookies;
  const logOutRequest = await fetch("https://kapi.kakao.com/v1/user/logout", {
    headers: {
      Authorization: `Bearer ${kakao_access_token}`,
      "Content-type": "application/json",
    },
  });
  const cookies = Object.keys(req.cookies);

  try {
    cookies.forEach((cookie) => {
      res.clearCookie(cookie);
    });
    return res.json({ message: "로그아웃 하셨습니다." });
  } catch (err) {
    next(err);
  }
});

/** 카카오 회원탈퇴 */
router.get("/kakao/withdrawal", authMiddleware, async (req, res, next) => {
  const { kakao_access_token } = req.cookies;
  const { userId } = req.user;
  await fetch("https://kapi.kakao.com/v1/user/unlink", {
    headers: {
      Authorization: `Bearer ${kakao_access_token}`,
      "Content-type": "application/json",
    },
  });
  const cookies = Object.keys(req.cookies);
  await prisma.users.delete({
    where: { userId: +userId },
  });

  try {
    cookies.forEach((cookie) => {
      res.clearCookie(cookie);
    });
    return res.json({ message: "회원탈퇴 하셨습니다." });
  } catch (err) {
    next(err);
  }
});

/** 네이버 로그인 */
let redirectURI = encodeURI(process.env.NAVER_REDIRECT);

router.get("/naver/sign-up", function (req, res) {
  try {
    const baseUrl = "https://nid.naver.com/oauth2.0/authorize";
    const config = {
      client_id: process.env.NAVER_ID,
      redirect_uri: redirectURI,
      response_type: "code",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
  } catch (error) {
    next(error);
  }
});
router.get("/naver/sign-in", async (req, res, next) => {
  try {
    const baseUrl = "https://nid.naver.com/oauth2.0/token";
    const config = {
      client_id: process.env.NAVER_ID, //restAPI 키
      client_secret: process.env.NAVER_SECRET, //보안 키
      grant_type: "authorization_code",
      redirect_uri: redirectURI,
      code: req.query.code,
      state: req.query.state,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const naverTokenRequest = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_ID,
        "X-Naver-Client-Secret": process.env.NAVER_SECRET,
        "Content-type": "text/json;charset=utf-8",
      },
    });
    const naverTokenData = await naverTokenRequest.json();
    console.log(naverTokenData);

    if ("access_token" in naverTokenData) {
      const { access_token } = naverTokenData;
      const userRequest = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-type": "text/json;charset=utf-8",
        },
      });
      const userData = await userRequest.json();
      let user = await prisma.users.findFirst({
        where: { email: userData.response.email },
      });
      // 네이버 로그인을 하지 않고 일반 가입한 사용자가 이메일이 같으면 오류코드를 띄워준다.
      if (user && !user.naverId) {
        return res.status(400).json({ message: "이미 가입한 이메일입니다." });
      }
      const gender = userData.response.gender === "M" ? "male" : "female";
      if (!user) {
        const newUser = await prisma.users.create({
          data: {
            naverId: userData.response.id,
            name: userData.response.name,
            email: userData.response.email,
            gender: gender,
          },
        });
        user = newUser;
      }

      // 네이버에서 지급한 엑세스토큰과 리프레시토큰을 저장
      res.cookie("naver_access_token", naverTokenData.access_token, {
        maxAge: naverTokenData.expires_in * 1000,
      });
      res.cookie("naver_refresh_token", naverTokenData.refresh_token);

      // 로컬에서 엑세스 토큰과 리프레시 토큰 발급
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

      res.cookie("authorization", `Bearer ${accessToken}`);
      res.cookie("refreshToken", refreshToken);

      return res.json({ message: "로그인에 성공하셨습니다." });
    } else {
      return res.redirect("/api/naver/sign-in");
    }
  } catch (error) {
    next(error);
  }
});

/** 네이버 회원탈퇴 */
router.get("/naver/withdrawal", authMiddleware, async (req, res, next) => {
  const { naver_access_token, authorization } = req.cookies;
  const { userId } = req.user;
  const baseUrl = "https://nid.naver.com/oauth2.0/token";
  const config = {
    client_id: process.env.NAVER_ID, //restAPI 키
    client_secret: process.env.NAVER_SECRET, //보안 키
    grant_type: "delete",
    access_token: naver_access_token,
    redirect_uri: redirectURI,
    service_provider: "naver",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  console.log(finalUrl);
  const naverTokenDelete = await fetch(finalUrl, {
    method: "GET",
  });

  const cookies = Object.keys(req.cookies);
  const deleteResponse = await naverTokenDelete.json();

  await prisma.users.delete({
    where: { userId: +userId },
  });
  try {
    cookies.forEach((cookie) => {
      res.clearCookie(cookie);
    });
    return res.json({ message: "회원탈퇴 하셨습니다." });
  } catch (err) {
    next(err);
  }
});

export default router;
