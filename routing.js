// hapiのルーティングではpath, method, handlerという3つの基本要素が必要になる

const Hapi = require("@hapi/hapi");
const Hoke = require("@hapi/hoek");
const Joi = require("joi");

const server = Hapi.server({
  port: 4000,
  host: "localhost",
});

server.route({
  method: ["PUT", "POST"], // 1つのルーティングに複数のメソッドを定義することができる
  path: "/hapi",
  handler: () => "hello",
});

// pathにパラメータが含まれていてもstringで定義。paramsを表すには{}でラップする
server.route({
  method: "GET",
  path: "/hapi/{name}", // この書き方で指定した場合、nameは必須となる
  handler: (req, h) => {
    return `Hello ${Hoke.escapeHtml(req.params.name)}`; // エスケープしてからpramasを取得。
  },
});

server.route({
  method: "GET",
  path: "/hapi/{user?}", // ?をつけることでオプショナルになる
  handler: (req, h) => {
    const user = req.params.name ? req.params.name : "stranger"; // オプショナルなので存在を判定

    return `Hello ${user}`;
  },
});

server.route({
  method: "GET",
  path: "/",
  handler: (req, h) => {
    const query = req.query.name; // クエリパラメータの値は req.query[key] で取れる

    return `Hello ${query}`;
  },
});

server.route({
  method: "GET",
  path: "/signup",
  handler: (req, h) => {
    const payload = req.payload; // リクエストボディの取得

    return `Welcom ${payload.username}`; // 今回はないが、基本的にバリデーションをつけるようにする
  },
});

// options
// optionsには認証、バリデーショ、事前要求などをそのルートハンドラに設定することができる
server.route({
  method: "GET",
  path: "/",
  handler: () => {},
  options: {
    auth: false, // authはstrategiesやschemeを登録することができる。ここではfalse
    validate: {
      payload: {
        username: Joi.string().min(1).max(7), // バリーデーションにはJoiを使うことが多い
        password: Joi.string.min(7),
      },
    },
  },
});
