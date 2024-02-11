import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* 댓글 생성 API */

router.post(
  "/posts/:postId/comments",
  authMiddleware,
  async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user;
    const { content } = req.body;

    // 게시글 존재 여부 확인
    const post = await prisma.post.findFirst({
      where: {
        postId: +postId,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    // 댓글 작성자 정보
    const author = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // 댓글 생성
    const comment = await prisma.comments.create({
      data: {
        userId: +userId,
        postId: +postId,
        content: content,
      },
    });

    if (!comment) {
      return res.status(500).json({ message: "댓글 생성에 실패했습니다." });
    }

    // 댓글 정보 반환
    return res.status(201).json({
      data: {
        ...comment,
        author,
      },
    });
  }
);

/* 댓글 조회 API */

// routes/comments.js

router.get("/posts/:postId/comments", async (req, res, next) => {
  const { postId } = req.params;
  const { page = 1, perPage = 10 } = req.query;

  // 게시글 존재 여부 확인
  const post = await prisma.post.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  }

  // 댓글 목록 조회
  const comments = await prisma.comments.findMany({
    where: {
      postId: +postId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: +perPage,
    skip: (page - 1) * perPage,
  });

  if (!comments) {
    return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
  }

  // 댓글 작성자 정보
  const authors = await prisma.user.findMany({
    where: {
      id: {
        in: comments.map((comment) => comment.userId),
      },
    },
  });

  // 댓글 정보 가공
  const commentData = comments.map((comment) => {
    const author = authors.find((user) => user.id === comment.userId);
    return {
      ...comment,
      author,
    };
  });

  // 댓글 목록 반환
  return res.status(200).json({
    data: commentData,
  });
});

/* 댓글 수정 API */

// routes/comments.js

router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    // 게시글 존재 여부 확인
    const post = await prisma.post.findFirst({
      where: {
        postId: +postId,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    // 댓글 존재 여부 확인
    const comment = await prisma.comments.findFirst({
      where: {
        commentId: +commentId,
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    }

    // 댓글 작성자 확인 (추후 구현)

    // 댓글 내용 수정
    const updatedComment = await prisma.comments.update({
      where: {
        commentId: +commentId,
      },
      data: {
        content: content,
      },
    });

    if (!updatedComment) {
      return res.status(500).json({ message: "댓글 수정에 실패했습니다." });
    }

    // 수정된 댓글 정보 반환
    return res.status(200).json({
      data: updatedComment,
    });
  }
);

/* 댓글 삭제 API */

// routes/comments.js

router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    const { commentId } = req.params;

    // 게시글 존재 여부 확인
    const post = await prisma.post.findFirst({
      where: {
        postId: +postId,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    // 댓글 존재 여부 확인
    const comment = await prisma.comments.findFirst({
      where: {
        commentId: +commentId,
      },
    });
  }
);

export default router;
