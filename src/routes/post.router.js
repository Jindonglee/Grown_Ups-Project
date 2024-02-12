import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import aws from 'aws-sdk';
import dotenv from 'dotenv';
import multerS3 from 'multer-s3';
import multer from 'multer';

const router = express.Router();
dotenv.config();

//AWS 인스턴스 생성
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2'
});

//스토리지 설정
const storageS3 = multerS3({
  s3: s3,
  bucket: 'seeker-bucket', 
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: 'public-read',
  metadata: function(req, file, cb) {
      cb(null, {fieldName: file.fieldname});
  },
  key: function (req, file, cb) {
      cb(null, `thumbnail/${Date.now()}_${file.originalname}`);
  }
});

//파일 업로드 미들웨어 설정
const uploadS3 = multer({
  storage: storageS3
}).single('photo');


/** 이미지 업로드 */
router.post('/endpoint/:postId', uploadS3, async (req, res) => {
  //const userId = req.user.userId;
	const postId = req.params.postId;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  /**
  if (post.userId !== userId) {
    return res.status(404).json({ message: "잘못된 접근입니다." });
  } */

  await prisma.posts.update({
    where: {
      postId: +postId,
    },
    data: {
      thumbnailImage: req.file.location,
    },
  });

  console.log(req.file);
  res.status(200).json({ success: true, message: '이미지가 성공적으로 업로드되었습니다' });
});


/** 이모지 등록 */
router.post('/save-emoji/:postId', async (req, res) => {
  //const userId = req.user.userId;
  const postId = req.params.postId;
  const emojiCode = req.body.emojiCode;

  console.log(emojiCode);

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  /**
  if (post.userId !== userId) {
    return res.status(404).json({ message: "잘못된 접근입니다." });
  } */

  try {
    const createdEmoji = await prisma.post_emoji.create({
      data: {
        postId : +postId,
        emojiCode: emojiCode
      }
    });

    console.log('이모지가 성공적으로 저장되었습니다:', createdEmoji);
    res.status(200).json({ success: true, message: '이모지가 성공적으로 저장되었습니다' });
  
  } catch (error) {
    console.error('이모지 저장 오류:', error);
    res.status(500).json({ success: false, message: '이모지 저장 중 오류가 발생했습니다' });
  }
});



/** 게시글 생성 */
router.post("/posts", async (req, res, next) => {
  //const userId = req.user.userId;
  const { title, content, category } = req.body;

  const post = await prisma.posts.create({
    data: {
      //userId: +userId,
      title,
      content,
      category
    },
  });

  return res.status(201).json({ data: post });
});


/** 게시글 조회 API */
router.get("/posts", async (req, res, next) => {
  let { orderKey, orderValue } = req.query;

  if (orderValue === null) {
    orderKey = "desc";
  }

  const post = await prisma.posts.findMany({
    select: {
      postId: true,
      title: true,
      content: true,
      thumbnailImage: true,
      category: true,
      updatedAt: true,
      /**
      user: {
        select: {
          name: true,
        },
      }, */
      post_emoji : {
        select : {
          emojiCode : true
        }
      }
    },
    orderBy: {
      [orderKey]: orderValue,
    },
  });

  return res.status(200).json({ data: post });
});


/** 게시글 상세 조회 */
router.get("/posts/:postId", async (req, res, next) => {
  const postId = req.params.postId;

  const post = await prisma.posts.findFirst({
    select: {
      postId: true,
      title: true,
      content: true,
      thumbnailImage: true,
      category: true,
      updatedAt: true,
      post_emoji: {
        select: {
          emojiCode: true,
        },
      },
    },
    where: {
      postId: +postId,
    },
  });

  if (!post)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

  return res.status(200).json({ data: post });
});


/** 게시글 수정 API **/
router.patch("/posts/:postId", async (req, res, next) => {
  const postId = req.params.postId;
  //const userId = req.user.userId;
  const body = req.body;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  /**
  if (post.userId !== userId) {
    return res.status(404).json({ message: "잘못된 접근입니다." });
  } */

  await prisma.posts.update({
    where: {
      postId: +postId,
    },
    data: {
      title: body.title,
      content: body.content,
      category: body.category
    },
  });

  return res.status(200).json({ message: "수정되었습니다." });
});


/** 게시글 삭제 API **/
router.delete("/posts/:postId", async (req, res, next) => {
  const postId = req.params.postId;
 // const userId = req.user.userId;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  /**
  if (post.userId !== userId) {
    return res.status(404).json({ message: "잘못된 접근입니다." });
  } */

  await prisma.posts.delete({
    where: {
      postId: +postId,
    },
  });

  return res.status(200).json({ message: "삭제되었습니다." });
});


export default router;
