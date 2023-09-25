const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    //api로 시작하는 요청은 프록시로 전달
    createProxyMiddleware("/api", {
      target: "http://15.165.137.38:5000", //API서버 주소
      changeOrigin: true,
    })
  );
};
