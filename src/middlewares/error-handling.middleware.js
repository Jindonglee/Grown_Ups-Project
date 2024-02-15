export default function (err, req, res, next) {
  // 에러를 출력합니다.
  console.error(err);
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  res.status(500).json({ errorMessage: "서버 내부 에러가 발생했습니다." });
};
