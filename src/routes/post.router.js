import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import aws from 'aws-sdk';
import dotenv from 'dotenv';
import multerS3 from 'multer-s3';
import multer from 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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
  storage: storageS3,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true); 
    } else {
      cb(new Error('jpg 또는 gif 또는 png 형식만 업로드할 수 있습니다.'));
    }
  }
}).array('photos', 5); //최대 5개


/** 이미지 업로드 */
router.post('/endpoint/:postId', authMiddleware, uploadS3, async (req, res) => {
  const userId = req.user.userId;
	const postId = req.params.postId;

  try {
    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    if (post.userId !== userId) {
      return res.status(404).json({ message: "잘못된 접근입니다." });
    } 

    const files = req.files; 

    for (const file of files) {
      const thumbnailUrl = file.location;
      const thumbnailKey = file.key;

      await prisma.thumbnail.create({
        data: {
          postId: +postId,
          thumbnailKey: thumbnailKey,
          thumbnailUrl: thumbnailUrl,
        },
      });
    }

    console.log(req.file);
    res.status(200).json({ success: true, message: '이미지가 성공적으로 업로드되었습니다' });
  
  } catch (error) {
    if (error instanceof multer.MulterError) {
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: '파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.' });
      } else {
        return res.status(500).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
      }
    } else {
      console.error('이미지 업로드 오류:', error);
      return res.status(500).json({ success: false, message: '이미지 업로드 중 오류가 발생했습니다' });
    }
  }
});


/** 이미지 삭제 */
router.delete('/endpoint', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const thumbnailId = req.body.thumbnailId;

  const thumbnail = await prisma.thumbnail.findFirst({
    where: {
      thumbnailId: thumbnailId,
    },
  });

  if (!thumbnail) {
    return res.status(404).json({ message: "게시글에 대한 썸네일 이미지를 찾을 수 없습니다." });
  }

  if (post.userId !== userId) {
    return res.status(404).json({ message: "잘못된 접근입니다." });
  }

  try {
    await s3.deleteObject({ Bucket: 'seeker-bucket', Key: thumbnail.thumbnailKey }).promise();

    await prisma.thumbnail.delete({
      where: {
        thumbnailId: thumbnail.thumbnailId,
      },
    });

    console.log('이미지가 성공적으로 삭제되었습니다.');
    res.status(200).json({ success: true, message: '이미지가 성공적으로 삭제되었습니다' });
  
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    res.status(500).json({ success: false, message: '이미지 삭제 중 오류가 발생했습니다' });
  }
});


/** 이미지 수정 */
router.put('/endpoint', authMiddleware, uploadS3, async (req, res) => {
  const userId = req.user.userId;
  const thumbnailId = req.body.thumbnailId;

  try {
    const thumbnail = await prisma.thumbnail.findFirst({
      where: {
        thumbnailId: thumbnailId,
      },
    });

    if (!thumbnail) {
      return res.status(404).json({ message: "썸네일 이미지를 찾을 수 없습니다." });
    }

    if (post.userId !== userId) {
      return res.status(404).json({ message: "잘못된 접근입니다." });
    }  

    await s3.deleteObject({ Bucket: 'seeker-bucket', Key: thumbnail.thumbnailKey }).promise();

    const thumbnailUrl = req.file.location;
    const thumbnailKey = req.file.key;

    await prisma.thumbnail.update({
      where: {
        thumbnailId: thumbnail.thumbnailId,
      },
      data: {
        thumbnailKey: thumbnailKey,
        thumbnailUrl: thumbnailUrl,
      },
    });
    

    console.log('이미지가 성공적으로 수정되었습니다.');
    res.status(200).json({ success: true, message: '이미지가 성공적으로 수정되었습니다' });
  
  } catch (error) {
    if (error instanceof multer.MulterError) {
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: '파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.' });
      } else {
        return res.status(500).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
      }
    } else {
      console.error('이미지 업로드 오류:', error);
      return res.status(500).json({ success: false, message: '이미지 업로드 중 오류가 발생했습니다' });
    }
  }
});


/** 이모지 등록 */
router.post('/save-emoji/:postId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
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

  if (post.userId === userId) {
    return res.status(404).json({ message: "본인 게시글에는 이모지를 저장할 수 없습니다." });
  }

  try {
    const createdEmoji = await prisma.post_emoji.create({
      data: {
        emojiCode: emojiCode,
        postId: +postId
      }
    });

    console.log('이모지가 성공적으로 저장되었습니다:', createdEmoji);
    res.status(200).json({ success: true, message: '이모지가 성공적으로 저장되었습니다' });
  
  } catch (error) {
    console.error('이모지 저장 오류:', error);
    res.status(500).json({ success: false, message: '이모지 저장 중 오류가 발생했습니다' });
  }
});


/** 이모지 취소 */
router.post('/cancel-emoji', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const postLikedId = req.body.postLikedId;

  const postEmoji = await prisma.post_emoji.findFirst({
    where: {
      post_likeId : postLikedId
    },
  });

  if (postEmoji.userId !== userId) {
    return res.status(404).json({ message: "본인이 등록한 이모지만 취소할 수 있습니다." });
  }

  try {
    await prisma.post_emoji.delete({
      where: {
        post_likeId : postLikedId
      },
    });

    console.log('이모지가 취소되었습니다:', postEmoji);
    res.status(200).json({ success: true, message: '취소되었습니다.' });
  
  } catch (error) {
    console.error('이모지 취소 오류:', error);
    res.status(500).json({ success: false, message: '이모지 취소 중 오류가 발생했습니다' });
  }
});



/** 게시글 생성 */
router.post("/posts", authMiddleware, async (req, res, next) => {
  const userId = req.user.userId;
  const { title, content, category } = req.body;

  const post = await prisma.posts.create({
    data: {
      userId: +userId,
      title,
      content,
      category
    },
  });

  return res.status(201).json({ data: post });
});


/** 게시글 조회 API */
router.get("/posts", authMiddleware, async (req, res, next) => {
  let { orderKey, orderValue } = req.query;

  if (!orderKey) orderKey = "createdAt";

  if (!orderValue) orderValue = "desc";
  else
    orderValue.toUpperCase() !== "ASC"
      ? (orderValue = "desc")
      : (orderValue = "asc");

  const post = await prisma.posts.findMany({
    select: {
      postId: true,
      title: true,
      content: true,
      category: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
        },
      },
      post_emoji : {
        select : {
          emojiCode : true
        }
      },
      thumbnail: { 
        select: {
          thumbnailUrl: true,
        },
      },
    },
    orderBy: {
      [orderKey]: orderValue,
    },
  });

  return res.status(200).json({ data: post });
});


/** 카테고리 별 게시글 조회 API */
router.get("/category", async (req, res, next) => {
  const { category } = req.query;
  let { orderValue, orderKey } = req.query;

  if (!orderKey) orderKey = "createdAt";

  if (!orderValue) orderValue = "desc";
  else
    orderValue.toUpperCase() !== "ASC"
      ? (orderValue = "desc")
      : (orderValue = "asc");

  const post = await prisma.posts.findMany({
    where: { category: category },
    select: {
      postId: true,
      title: true,
      content: true,
      category: true,
      updatedAt: true,
      /**
      user: {
        select: {
          name: true,
        },
      }, */
      post_emoji: {
        select: {
          emojiCode: true,
        },
      },
      thumbnail: { 
        select: {
          thumbnailUrl: true,
        },
      },
    },
    orderBy: {
      [orderKey]: orderValue,
    },
  });

  return res.status(200).json({ data: post });
});


/** 게시글 상세 조회 */
router.get("/posts/:postId", authMiddleware, async (req, res, next) => {
  const postId = req.params.postId;

  const post = await prisma.posts.findFirst({
    select: {
      postId: true,
      title: true,
      content: true,
      category: true,
      updatedAt: true,
      post_emoji: {
        select: {
          emojiCode: true,
        },
      },
      thumbnail: {
        select: {
          thumbnailUrl: true,
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
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.userId;
  const body = req.body;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  if (post.userId !== userId) {
    return res.status(404).json({ message: "잘못된 접근입니다." });
  }

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
router.delete("/posts/:postId", authMiddleware, async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.userId;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
  }

  if (post.userId !== userId) {
    return res.status(404).json({ message: "잘못된 접근입니다." });
  }

  await prisma.posts.delete({
    where: {
      postId: +postId,
    },
  });

  return res.status(200).json({ message: "삭제되었습니다." });
});


export default router;
