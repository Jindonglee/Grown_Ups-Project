import winston from "winston";

const logger = winston.createLogger({
  level: "info", // error,warn,debug
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export default function (req, res, next) {
  const start = new Date().getTime();

  res.on("finish", () => {
    const duration = new Date().getTime() - start;
    logger.info(
      `Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration ${duration}ms`
    );
  });

  next();
}

// middlewares 폴더에 있는 파일이므로 log.router.js에서 log.middleware.js로 수정했습니다.
