import express from "express";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// 댓글에 필요한 것들?
// 포스트 id,

// commentId, userId, postId, content

// createdAt
// updatedAt

// 업로드 POST /api/posts/{postId}/comments/{commentId}

router.post("/posts/{postId}/comments/{commentsId}", async (req, res) => {
  // req : request, res : response
  // request에서 받아온 데이터를 사용해서 작업을 수행한다.

  const { value } = req.body;

  return res.status(code).json({ json });
});

// 조회 GET /api/posts/{postId}/comments/{commentId}

router.get("/posts/{postId}/comments/{commentsId}", async (req, res) => {
  // req : request, res : response
  // request에서 받아온 데이터를 사용해서 작업을 수행한다.

  const { value } = req.body;

  return res.status(code).json({ json });
});

// 수정 PUT /api/posts/{postId}/comments/{commentId}

router.put("/posts/{postId}/comments/{commentsId}", async (req, res) => {
  // req : request, res : response
  // request에서 받아온 데이터를 사용해서 작업을 수행한다.

  const { value } = req.body;

  return res.status(code).json({ json });
});

// 삭제 DELETE /api/posts/{postId}/comments/{commentId}

router.delete("/posts/{postId}/comments/{commentsId}", async (req, res) => {
  // req : request, res : response
  // request에서 받아온 데이터를 사용해서 작업을 수행한다.

  const { value } = req.body;

  return res.status(code).json({ json });
});

export default router;
