// 画像など静的ファイルを返さなければいけない場合がある
// inertというhapiのプラグインを使うことによってこの機能を便利に実現する
// 新たなhandler methods(h.file())をを提供し、これにより静的ファイルの提供を実現する。
// h.fileでハンドラごとにパスを書くのはめんどくさいのでserverオブジェクト作成時にベースとなるルートを定義できる

"use strict";

const Hapi = require("@hapi/hapi");
const Path = require("path");

const start = async () => {
  const server = Hapi.server({
    routes: {
      files: {
        relativeTo: Path.join(__dirname, "public"), // h.file()で使うbase path を定義
      },
    },
  });

  await server.register(require("@hapi/inert"));

  server.route([
    {
      method: "GET",
      path: "/picture",
      handler: (req, h) => {
        // inertによってh.file()の使用が可能
        // relativeTo で相対を設定しているのでこんな感じでかける
        return h.file("flight.jpg");
      },
    },
    {
      method: "GET",
      path: "/pic",
      handler: {
        file: "flight.jpg", // ファイル返すだけならこれでもいける
      },
    },
  ]);

  await server.start();

  console.log("サーバー起動: " + server.info.uri);
};

start();
