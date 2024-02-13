import swaggerUi from 'swagger-ui-express';
import swaggereJsdoc from 'swagger-jsdoc';

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'sparta-resume API',
      version: '1.0.0',
      description: 'API with express',
    },
    host: 'localhost:3000',
    basePath: '/',
  },
  apis: ['./src/routes/*.js', './swagger/*'],
};

const specs = swaggereJsdoc(options);

/**
 * @swagger
 * paths:
 *  /api/sign-up:
 *    post:
 *      tags:
 *      - users
 *      summary: 회원가입
 *      description: 회원가입
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
 *                passwordConfirm:
 *                  type : string
 *                name:
 *                  type : string
 *                age:
 *                  type : integer
 *                gender:
 *                  type : string
 *                status:
 *                  type : string
 *                oneliner:
 *                  type : string
 *                technology:
 *                  type : string
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 회원가입 성공
 *       409:
 *        description: 이미 존재하는 이메일입니다.
 *       400:
 *        description: 요청 값 올바르지 않음.
 *  /api/sign-in:
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
 *        description: 이메일 혹은 비밀번호가 일치하지 않음
 *  /api/users:
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
 *               gender:
 *                 type : string
 *     responses:
 *       200 :
 *          description: 사용자 정보 변경 성공.
 *       404 :
 *          description : 사용자 정보가 존재하지 않습니다.
 *  /api/refresh:
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
