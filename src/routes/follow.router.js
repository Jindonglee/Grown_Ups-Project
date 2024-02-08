import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 팔로우 및 언팔로우 기능
router.post("/follow", authMiddleware, async (req, res, next) => {
  const followerId = req.body;
  const { userId } = req.user;

  if (!followerId)
    return res
      .status(400)
      .json({ message: "follow하려는 유저의 정보가 올바르지 않습니다." });

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
  });

  if (!user) {
    return res.status(400).json({ message: "유저 정보가 올바르지 않습니다." });
  }

  const checkFollow = await prisma.follow.findMany({
    where: {
      and: [{ followerId: +followerId }, { followingId: user.userId }],
    },
  });

  if (checkFollow) {
    await prisma.follow.delete({
      where: {
        and: [{ followerId: +followerId }, { followingId: user.userId }],
      },
    });
    return res.status(200).json({ message: "언팔로우 되었습니다!" });
  }

  await prisma.follow.create({
    data: {
      followerId: +followerId,
      followingId: user.userId,
    },
  });

  return res
    .status(200)
    .json({ message: `${user.name}님을 팔로우 하셨습니다!` });
});

// 특정 유저의 follower 목록 요청
router.get("/follower/:userId", authMiddleware, async (req, res, next) => {
  const userId = req.params;
  const myUser = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
  });

  if (!user)
    return res.status(400).json({ message: "유저 정보가 올바르지 않습니다." });

  if (user.locked === "lock") {
    if (userId !== myUser) {
      const checkFollower = await prisma.follow.findMany({
        where: {
          or: [
            { and: [{ followerId: user.userId }, { followingId: myUser }] },
            { and: [{ followerId: myUser }, { followingId: user.userId }] },
          ],
        },
      });

      if (checkFollower.length !== 2) {
        return res.status(400).json({
          message:
            "이 유저의 follow정보는 비공개입니다. 열람하시려면 서로 follow한 상태이어야 합니다.",
        });
      }
    }
  }
  const follower = await prisma.follow.findMany({
    where: { followingId: user.userId },
    select: {
      users: {
        select: {
          name: true,
        },
      },
    },
  });

  return res.status(200).json({ data: follower });
});

// 특정 유저의 following 목록 요청
router.get("/following/:userId", authMiddleware, async (req, res, next) => {
  const userId = req.params;
  const myUser = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
  });

  if (!user)
    return res.status(400).json({ message: "유저 정보가 올바르지 않습니다." });

  if (user.locked === "lock") {
    if (userId !== myUser) {
      const checkFollower = await prisma.follow.findMany({
        where: {
          or: [
            { and: [{ followerId: user.userId }, { followingId: myUser }] },
            { and: [{ followerId: myUser }, { followingId: user.userId }] },
          ],
        },
      });

      if (checkFollower.length !== 2) {
        return res.status(400).json({
          message:
            "이 유저의 follow정보는 비공개입니다. 열람하시려면 서로 follow한 상태이어야 합니다.",
        });
      }
    }
  }
  const following = await prisma.follow.findMany({
    where: { followerId: user.userId },
    select: {
      users: {
        select: {
          name: true,
        },
      },
    },
  });

  return res.status(200).json({ data: following });
});

// 특정 유저의 팔로워, 팔로잉 수 조회
router.get('/follow/:userId', async (req,res,next) => {
    const userId = req.params;

    const user = await prisma.users.findFirst({
        where: {userId: +userId}
    });

    if(!user)
        return res.status(400).json({message: "유저 정보가 올바르지 않습니다."});
    
    const follower = await prisma.follow.count({
        where: {followingId :  user.userId}
    });

    const following = await prisma.follow.count({
        where: {followerId : user.userId}
    });

    if(!follower)
        follower = 0;

    if(!following)
        following = 0;

    return res.status(200).json({follower: follower, following: following});
})