import express from "express";
import UsersRouter from "./routes/user.router.js";
 import postsRouter from "./routes/post.router.js";
import commentsRouter from "./routes/comment.router.js";
import kakaoRouter from "./routes/kakao.router.js";
import followRouter from "./routes/follow.router.js";
import AuthRouter from "./routes/auth.router.js";
import logMiddleware from "./middlewares/log.middleware.js";
import errorHandlingMiddleware from "./middlewares/error-handling.middleware.js";
import cookieParser from "cookie-parser";
import { swaggerUi, specs } from "./routes/swagger.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api", [
  UsersRouter,
  AuthRouter,
   postsRouter,
  commentsRouter,
  kakaoRouter,
  followRouter,
]);
app.use(errorHandlingMiddleware)

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});