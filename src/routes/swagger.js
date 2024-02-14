import swaggerUi from "swagger-ui-express";
import swaggereJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "취업 나침반 API",
      version: "1.0.0",
      description: "API with express",
    },
    host: "localhost:3000",
    basePath: "/",
  },
  apis: ["./src/routes/*.js", "./swagger/*"],
};

const specs = swaggereJsdoc(options);

/**
 * @swagger
 * paths:
 *  /api/users/sign-up:
 *    post:
 *      tags:
 *      - users
 *      summary: 회원가입
 *      description: 회원가입
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  required: true
 *                password:
 *                  type : string
 *                  required: true
 *                checkPw:
 *                  type : string
 *                  required: true
 *                name:
 *                  type : string
 *                  required: true
 *                age:
 *                  type : integer
 *                  required: false
 *                gender:
 *                  type : string
 *                  required: true
 *                  default: female
 *                status:
 *                  type : string
 *                  required: true
 *                  default: job_seeker
 *                oneliner:
 *                  type : string
 *                  required: false
 *                technology:
 *                  type : string
 *                  required: false
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 회원가입 성공
 *       409:
 *        description: 이미 존재하는 이메일입니다.
 *       400:
 *        description: 요청 값 올바르지 않음.
 *  /api/users/validation:
 *    get:
 *      tags:
 *      - users
 *      summary: 이메일 인증
 *      description: 이메일 인증 처리
 *      parameters:
 *        - name: email
 *          in: query
 *          description: 인증 이메일 입력
 *          required: true
 *          schema:
 *            type: string
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 인증 성공
 *       400:
 *        description: 오류 발생
 *       412:
 *        description: 이메일 인증 오류 발생
 *  /api/users/login:
 *    post:
 *      tags:
 *      - users
 *      summary: 로그인
 *      description: 로그인
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type : string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 로그인 성공
 *       401:
 *        description: 이메일 혹은 비밀번호가 일치하지 않음 / 이메일 인증 미완료
 *  /api/me:
 *    get:
 *      tags:
 *      - users
 *      summary: 유저 정보 조회
 *      description: 현재 로그인된 유저 정보 조회
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 유저 정보 조회 성공
 *  /api/me/{userId}:
 *    patch:
 *     tags:
 *       - users
 *     summary: 유저 정보 수정
 *     description: 유저 정보 수정
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type : integer
 *               oneliner:
 *                 type : string
 *               status:
 *                 type : string
 *               technology:
 *                 type : string
 *               password:
 *                 type : string
 *     responses:
 *       200 :
 *          description: 사용자 정보 변경 성공.
 *       400 :
 *          description : 비밀번호 불일치
 *       404 :
 *          description : 사용자 정보가 존재하지 않습니다.
 *  /api/users/exit:
 *    get:
 *      tags:
 *      - users
 *      summary: 회원 탈퇴
 *      description: 회원 탈퇴
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 회원 탈퇴 성공
 *       400:
 *        description: 이메일 혹은 비밀번호가 일치하지 않음 / 유저 정보 없음
 *       500:
 *        description: 탈퇴 과정에서 오류 발생
 *  /api/kakao/sign-up:
 *    get:
 *      tags:
 *      - social-login
 *      summary: 카카오 계정 로그인
 *      description: 카카오 계정 로그인 [인증 페이지로](https://jd-develop.shop/api/kakao/sign-up) 카카오 인증페이지로 이동.
 *      produces:
 *      - application/json
 *      responses:
 *       redirect:
 *        description: 로그인 성공
 *  /api/naver/sign-up:
 *    get:
 *      tags:
 *      - social-login
 *      summary: 네이버 계정 로그인
 *      description: 네이버 계정 로그인 [인증 페이지로](http://localhost:3000/api/naver/sign-up) 네이버 인증페이지로 이동.
 *      produces:
 *      - application/json
 *      responses:
 *       redirect:
 *        description: 로그인 성공
 *  /api/token:
 *    post:
 *      tags:
 *      - token
 *      summary: AccessToken 재발급
 *      description: AccessToken 재발급
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                refreshToken:
 *                  type: string
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: AccessToken 재발급 성공
 *       400:
 *        description: refreshToken 값 올바르지 않음
 *       401:
 *        description: refreshToken이 유저가 발급받은 토큰과 일치하지 않음
 *  /api/follow:
 *    post:
 *      tags:
 *      - follow
 *      summary: 팔로우 요청
 *      description: 팔로우 요청
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                followingId:
 *                  type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 팔로우 하였습니다! / 언팔로우 하였습니다!
 *       400:
 *        description: 유저 정보가 올바르지 않습니다.
 *  /api/follow/follower/{selectUserId}:
 *    get:
 *      tags:
 *      - follow
 *      summary: 팔로워 목록 조회
 *      description: 특정 유저의 팔로워 목록 조회
 *      parameters:
 *        - name: selectUserId
 *          in: path
 *          description: 목록 확인할 userId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 팔로워 data 출력
 *       400:
 *        description: 유저 정보가 올바르지 않습니다.
 *       401:
 *        description: 열람 권한이 없습니다.
 *  /api/follow/following/{selectUserId}:
 *    get:
 *      tags:
 *      - follow
 *      summary: 팔로잉 목록 조회
 *      description: 특정 유저의 팔로잉 목록 조회
 *      parameters:
 *        - name: selectUserId
 *          in: path
 *          description: 목록 확인할 userId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 팔로잉 data 출력
 *       400:
 *        description: 유저 정보가 올바르지 않습니다.
 *       401:
 *        description: 열람 권한이 없습니다.
 *  /api/follow/{userId}:
 *    get:
 *      tags:
 *      - follow
 *      summary: 팔로워 및 팔로잉 수 조회
 *      description: 특정 유저의 팔로워 및 팔로잉 수 조회
 *      parameters:
 *        - name: userId
 *          in: path
 *          description: 확인할 userId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 팔로워, 팔로잉 수 출력
 *       400:
 *        description: 유저 정보가 올바르지 않습니다.
 *  /api/recommend:
 *    get:
 *      tags:
 *      - follow
 *      summary: 팔로우 유저 추천천
 *      description: tech가 겹치는 유저 추천
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 추천 유저의 userId, 이름 목록 출력
 *       400:
 *        description: technology 데이터 없음음
 *  /api/endpoint/{postId}:
 *    post:
 *      tags:
 *      - post
 *      summary: 이미지 업로드
 *      description: 이미지 업로드
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 이미지 업로드 할 postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이미지 업로드 성공
 *       404:
 *        description: 게시글 조회 실패
 *  /api/save-emoji/{postId}:
 *    post:
 *      tags:
 *      - post
 *      summary: 이모지 등록
 *      description: 이모지 등록
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                emojiCode:
 *                  type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이모지 저장 성공
 *       404:
 *        description: 게시글 조회 실패
 *       500:
 *        description: 이모지 저장 중 오류 발생
 *  /api/posts:
 *    post:
 *      tags:
 *      - post
 *      summary: 게시글 생성
 *      description: 게시글 생성
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                content:
 *                  type: string
 *                category:
 *                  type: string
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 게시글 생성 완료
 *    get:
 *      tags:
 *      - post
 *      summary: 전체 게시글 조회
 *      description: 전체 게시글 조회
 *      parameters:
 *        - name: orderKey
 *          in: query
 *          description: 정렬 기준 입력 (category, createdAt ...)
 *          required: true
 *          schema:
 *            type: string
 *        - name: orderValue
 *          in: query
 *          description: ASC or DESC 공백은 DESC 처리
 *          required: false
 *          schema:
 *            type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 게시글 조회 성공
 *  /api/posts/{postId}:
 *    get:
 *      tags:
 *      - post
 *      summary: 게시글 상세 조회
 *      description: 게시글 상세 조회
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 조회할 postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 게시글 조회 성공
 *       404:
 *        description: 게시글 조회 실패
 *    patch:
 *      tags:
 *      - post
 *      summary: 게시글 수정
 *      description: 게시글 수정
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 수정할 postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                content:
 *                  type: string
 *                category:
 *                  type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 게시글 수정 성공
 *       404:
 *        description: 게시글 조회 실패
 *    delete:
 *      tags:
 *      - post
 *      summary: 게시글 삭제
 *      description: 게시글 삭제
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 삭제할 postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 게시글 삭제 성공
 *       404:
 *        description: 게시글 조회 실패
 */

export { swaggerUi, specs };
