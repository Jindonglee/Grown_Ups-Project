import express from "express";
import UsersRouter from "./routes/user.router.js";
import postsRouter from "./routes/post.router.js";
import commentsRouter from "./routes/comment.router.js";
import kakaoRouter from "./routes/kakao.router.js";
import followRouter from "./routes/follow.router.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", [UsersRouter, postsRouter, commentsRouter, kakaoRouter, followRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});