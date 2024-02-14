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
 *  /api/kakao/token:
 *    get:
 *      tags:
 *      - token
 *      summary: 카카오 AccessToken 재발급
 *      description: 카카오 토큰 재발급
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 카카오 엑세스토큰이 발급되었습니다.
 *       400:
 *        description: 카카오 리프레시 토큰이 없습니다.
 *  /api/naver/token:
 *    get:
 *      tags:
 *      - token
 *      summary:  네이버 AccessToken 재발급
 *      description: 네이버 토큰 재발급
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 네이버 엑세스토큰이 발급되었습니다.
 *       400:
 *        description: 네이버 리프레시 토큰이 없습니다.
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
 *      consumes:
 *        - multipart/form-data
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 이미지 업로드 할 postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                photos:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: binary
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이미지 업로드 성공
 *       404:
 *        description: 게시글 조회 실패
 *    delete:
 *      tags:
 *      - post
 *      summary: 이미지 삭제
 *      description: 이미지 삭제
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 이미지 삭제 할 postId 입력
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
 *                thumbnailId:
 *                  type: string
 *                  example: "first, second, third, ..."
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이미지 삭제 성공
 *       404:
 *        description: 게시글 조회 실패 / 썸네일 이미지 조회 불가
 *       500:
 *        description: 이미지 삭제 중 오류 발생
 *    put:
 *      tags:
 *      - post
 *      summary: 이미지 수정
 *      description: 이미지 수정
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 이미지 수정 할 postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                thumbnailId:
 *                  required: true
 *                  type: array
 *                  items:
 *                    type: string
 *                photos:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: binary
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이미지 수정 성공
 *       404:
 *        description: 게시글 조회 실패 / 썸네일 이미지 조회 불가 / 파일 크기 10MB 초과
 *       500:
 *        description: 이미지 업로드 중 오류 발생
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
 *                  type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이모지 저장 성공
 *       404:
 *        description: 게시글 조회 실패
 *       500:
 *        description: 이모지 저장 중 오류 발생
 *  /api/cancel-emoji:
 *    post:
 *      tags:
 *      - post
 *      summary: 이모지 취소
 *      description: 이모지 취소
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                postLikedId:
 *                  type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이모지 취소 성공
 *       404:
 *        description: 본인이 등록한 이미지가 아님
 *       500:
 *        description: 이모지 취소 중 오류 발생
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
 *  /api/category:
 *    get:
 *      tags:
 *      - post
 *      summary: 카테고리 별 게시글 조회
 *      description: 카테고리 별 게시글 조회
 *      parameters:
 *        - name: category
 *          in: query
 *          description: 카테고리 입력
 *          required: true
 *          schema:
 *            type: string
 *        - name: orderKey
 *          in: query
 *          description: 정렬 기준 입력 (default = createdAt)
 *          required: false
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
 *       404:
 *        description: 게시글 조회 실패
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
 *  /api/posts/{postId}/comments:
 *    post:
 *      tags:
 *      - comment
 *      summary: 댓글 생성
 *      description: 댓글 생성
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
 *                content:
 *                  type: string
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 댓글 생성 완료
 *       404:
 *        description: 게시글이 존재하지 않습니다.
 *    get:
 *      tags:
 *      - comment
 *      summary: 댓글 조회
 *      description: 댓글 조회
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *        - name: page
 *          in: query
 *          description: page 입력
 *          required: false
 *          schema:
 *            type: integer
 *        - name: perPage
 *          in: query
 *          description: 한 페이지에 볼 댓글 갯수
 *          required: false
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 댓글 조회 완료
 *       404:
 *        description: 게시글이 존재하지 않습니다.
 *  /api/posts/{postId}/comments/{commentId}:
 *    put:
 *      tags:
 *      - comment
 *      summary: 댓글 수정
 *      description: 댓글 수정
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *        - name: commentId
 *          in: path
 *          description: commentId 입력
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
 *                content:
 *                  type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 댓글 수정 완료
 *       404:
 *        description: 게시글이 존재하지 않습니다.
 *       500:
 *        description: 댓글 수정 실패
 *    delete:
 *      tags:
 *      - comment
 *      summary: 댓글 삭제
 *      description: 댓글 삭제
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: postId 입력
 *          required: true
 *          schema:
 *            type: integer
 *        - name: commentId
 *          in: path
 *          description: commentId 입력
 *          required: true
 *          schema:
 *            type: integer
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 댓글 삭제 완료
 *       404:
 *        description: 게시글이 존재하지 않습니다.
 */

export { swaggerUi, specs };
