import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 이메일 보낼 아이디 설정
const { email_service, nodemailer_user, nodemailer_pass } = process.env;

const transporter = nodemailer.createTransport({
  service: email_service,
  auth: {
    user: nodemailer_user,
    pass: nodemailer_pass,
  },
});

router.post("/users/sign-up", async (req, res, next) => {
  try {
    const { email, name, password, checkPw, gender, age, oneliner, status } =
      req.body;

    if (!email || !password || !gender || !checkPw || !name || !status) {
      return res.status(400).json({
        success: false,
        message: "필수 정보를 모두 입력해주세요.",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "비밀번호는 최소 6자 이상입니다." });
    }

    if (password !== checkPw) {
      return res.status(400).json({
        success: false,
        message: "비밀번호와 비밀번호 확인값이 일치하지 않습니다.",
      });
    }

    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });

    if (isExistUser) {
      return res.status(400).json({ message: "사용할 수 없는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        gender,
        age,
        oneliner,
        status,
        isEmailValid: false,
      },
    });

    // TODO: 나중에 배포시 수정필요
    const url = `http://localhost:3000/api/users/validation?email=${email}`;

    await transporter.sendMail({
      // 보내는 곳의 이름과, 메일 주소를 입력
      from: `"Employ Compass" <${nodemailer_user}>`,
      // 받는 곳의 메일 주소를 입력
      to: email,
      // 보내는 메일의 제목을 입력
      subject: "[Employ Compass] 회원가입 인증 메일입니다.",
      // 보내는 메일의 내용을 입력
      // text: 일반 text로 작성된 내용
      // html: html로 작성된 내용
      html: `<h2 style="margin: 20px 0">[Employ Compass] 메일확인</h2>
      <a href="${url}" style="background-color: #ff2e00; color:#fff; text-decoration: none; padding: 10px 20px; border-radius: 20px;">가입확인</a>`,
    });

    return res.status(201).json({ email, name, gender, age, oneliner });
  } catch (err) {
    next(err);
  }
});

// 이메일 인증 처리 관련 API (버튼 클릭 시 작동)
router.get("/users/validation", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(412).send({ message: "비정상적인 접근입니다." });

    const emailValid = await prisma.users.findFirst({
      where: { email: email },
      select: {
        email: true,
        isEmailValid: true,
      },
    });

    if (!emailValid)
      return res.status(412).send({
        message: "해당 이메일은 요청된 이메일이 아닙니다.",
      });
    if (emailValid.isEmailValid)
      return res.status(412).send({ message: "이미 인증된 이메일 입니다." });

    await prisma.users.update({
      where: { email: email },
      data: { isEmailValid: true },
    });

    return res.status(201).send({ message: "인증이 완료되었습니다." });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "오류가 발생하였습니다." });
  }
});

// 로그인 api
router.post("/users/login", async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.users.findFirst({
    where: { email },
  });

  if (!user)
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });

  if (!bcrypt.compare(password, user.password))
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

  if (!user.isEmailValid) {
    return res
      .status(401)
      .json({ message: "이메일 인증을 완료해야 로그인이 가능합니다." });
  }

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

  return res.json({
    accessToken,
    refreshToken,
  });
});

// 내정보 조회
router.get("/me", authMiddleware, async (req, res, next) => {
  const user = res.user;

  return res.json({
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    gender: user.gender,
    age: user.age,
    onliner: user.oneliner,
    status: user.status,
    technology: user.technology,
    createdAt: user.createdAt,
  });
});

// 내정보 수정
router.patch("/me/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const { age, oneliner, status, technology, password } = req.body;

    // 유저 비밀번호 추출
    const user = await prisma.users.findFirst({
      where: { userId: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 유저 정보 업데이트
    const updatedUser = await prisma.users.update({
      where: { userId: userId },
      data: {
        password,
        age,
        oneliner,
        status,
        technology,
      },
    });

    return res.json({
      message: "내정보가 성공적으로 업데이트되었습니다.",
    });
  } catch (error) {
    return next(error);
  }
});

// 회원 탈퇴 api
router.get("/users/exit", authMiddleware, async (req, res, next) => {
  const { kakao_access_token, naver_access_token } = req.cookies;
  const { userId } = req.body;

  // 카카오 토큰이 있으면 카카오 회원탈퇴 함수 호출
  if (kakao_access_token) {
    return kakaoWithdrawal(req, res, next);
  }

  // 네이버 토큰이 있으면 네이버 회원탈퇴 함수 호출
  if (naver_access_token) {
    return naverWithdrawal(req, res, next);
  }

  // 사용자 인증
  if (!kakao_access_token && !naver_access_token) {
    const user = await prisma.users.findFirst({
      where: {
        userId: +userId,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "유저 정보가 없습니다." });
    }
  }
  try {
    // 사용자 삭제
    await prisma.users.delete({
      where: {
        userId: +userId,
      },
    });

    return res.json({ message: "탈퇴가 완료되었습니다." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "탈퇴 과정에서 오류가 발생했습니다." });
  }
});

/** 카카오 회원탈퇴 */
const kakaoWithdrawal = async (req, res, next) => {
  const { kakao_access_token } = req.cookies;
  const { userId } = req.user;

  try {
    // 카카오 회원탈퇴 요청
    await fetch("https://kapi.kakao.com/v1/user/unlink", {
      headers: {
        Authorization: `Bearer ${kakao_access_token}`,
        "Content-type": "application/json",
      },
    });

    // 사용자 정보 삭제
    await prisma.users.delete({
      where: { userId: +req.user },
    });

    // 모든 쿠키 제거
    const cookies = Object.keys(req.cookies);
    cookies.forEach((cookie) => {
      res.clearCookie(cookie);
    });

    return res.json({ message: "회원탈퇴 하셨습니다." });
  } catch (err) {
    next(err);
  }
};

/** 네이버 회원탈퇴 */
const naverWithdrawal = async (req, res, next) => {
  const { naver_access_token } = req.cookies;
  const { userId } = req.user;
  const baseUrl = "https://nid.naver.com/oauth2.0/token";
  const config = {
    client_id: process.env.NAVER_ID, //restAPI 키
    client_secret: process.env.NAVER_SECRET, //보안 키
    grant_type: "delete",
    access_token: naver_access_token,
    redirect_uri: process.env.NAVER_REDIRECT,
    service_provider: "naver",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  try {
    // 네이버 회원탈퇴 요청
    await fetch(finalUrl, {
      method: "GET",
    });

    // 사용자 정보 삭제
    await prisma.users.delete({
      where: { userId: +userId },
    });

    // 모든 쿠키 제거
    const cookies = Object.keys(req.cookies);
    cookies.forEach((cookie) => {
      res.clearCookie(cookie);
    });

    return res.json({ message: "회원탈퇴 하셨습니다." });
  } catch (err) {
    next(err);
  }
};

export default router;
