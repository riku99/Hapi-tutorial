// Logging
// Hapiにはいくつかのログメソッドが組み込まれている。server.log(tags, [data, [timestamp]]) と request.log(tags, [data])
// 1つのリクエストをスコープとしてログを出力したい場合は request.log()
// サーバー全体など1つのリクエストをスコープとしない場合は server.log()

// ただ、hapiに埋め込まれているAPIを使うよりプラグインの方が便利かつ簡単だったので hapi-pino というプラグインを使う
// https://github.com/pinojs/hapi-pino

const Hapi = require("@hapi/hapi");
const events = require("events");

const init = async () => {
  const server = Hapi.server({
    port: 4001,
    host: "localhost",
    debug: false, // pinoを使うときはdebugをfalseにする
  });

  server.route([
    {
      method: "GET",
      path: "/",
      handler: (request, h) => {
        // pinoをルートハンドラ内で使うこともできる
        request.logger.info("In handler %s", request.path);
        return "Hapi";
      },
    },
    {
      method: "GET",
      path: "/hapi",
      handler: (request, h) => {
        // メソッドの記述なしでもログが出力される
        return "Hapi World";
      },
    },
  ]);

  // hapi-pinoを登録することでログの詳細をJSONで自動出力できるようにする
  await server.register({
    plugin: require("hapi-pino"),
    options: {
      prettyPrint: process.env !== "production", // ログを整った形で出力する。本番環境ではfalse
      redact: ["req.headers.authorization"],
      logPayload: true, // ログにリクエストpayloadを出力
      logQueryParams: true, // ログにクエリパラメータを出力
    },
  });

  server.logger.info("スタート");

  await server.start();
};

init();
