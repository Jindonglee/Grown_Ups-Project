import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 이메일 보낼 아이디 설정
// const { email_service, user, pass } = process.env;

// const transporter = nodemailer.createTransport({
//   service: email_service,
//   auth: {
//     user: user,
//     pass: pass,
//   },
// });

router.post("/users/sign-up", async (req, res, next) => {
  try {
    const { email, name, password, checkPw, gender, age, oneliner } = req.body;

    if (!email || !password || !gender || !age || !checkPw || !name) {
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
      },
    });

    return res.status(201).json({ email, name, gender, age, oneliner });
  } catch (err) {
    next(err);
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

  const accessToken = jwt.sign({ userId: user.userId }, "custom-secret-key", {
    expiresIn: "12h",
  });
  const refreshToken = jwt.sign({ userId: user.userId }, "resumeToken", {
    expiresIn: "7d",
  });

  return res.json({
    accessToken,
    refreshToken,
  });
});

// 회원 탈퇴 api
router.post("/users/exit", async (req, res) => {
  const { email, password } = req.body;

  // 사용자 인증
  const user = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
  }

  try {
    // 사용자 삭제
    await prisma.users.delete({
      where: {
        email,
      },
    });

    return res.json({ message: "탈퇴가 완료되었습니다." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "탈퇴 과정에서 오류가 발생했습니다." });
  }
});

export default router;
