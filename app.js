"use strict";
const Hapi = require("@hapi/hapi");
const init = async () => {
  // port番号とホスト情報と共にサーバの作成
  const server = Hapi.server({
    port: 3000,
    host: "localhost", // docker containerで起動する時はlocalhostだとアクセスできないので "0.0.0.0"が必要かも
  });

  server.route({
    method: "GET",
    path: "/", // pathにはパラメータも加えろことができる
    handler: (req, h) => {
      // handlerはvalue, Promise, errorのいずれかを返さなければいけない
      return "Hello World";
    },
  });

  await server.start();
  console.log(server.info.uri + "でサーバーの作成");
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
