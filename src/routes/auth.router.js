import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;

  const token = jwt.verify(refreshToken, "resumeToken");
  if (!token) {
    return res.status(401).end();
  }

  const user = await prisma.users.findFirst({
    where: {
      userId: token.userId,
    },
  });

  if (!user) {
    return res.status(401).end();
  }

  const newAccessToken = jwt.sign(
    { userId: user.userId },
    "custom-secret-key",
    { expiresIn: "12h" }
  );
  const newRefreshToken = jwt.sign({ userId: user.userId }, "resumeToken", {
    expiresIn: "7d",
  });

  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export default router;
