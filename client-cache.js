"use strict";

const Hapi = require("@hapi/hapi");

const start = async () => {
  const server = Hapi.server({ port: 4001 });

  server.route([
    {
      method: "GET",
      path: "/hapi/{ttl?}",
      handler: (requset, h) => {
        // h.response()からはレスポンスオブジェクトが返される
        // このオブジェクトにはリクエスト、レスポンスの値に加えてヘッダやフラグなどが含まれる
        // ライフサイクルメソッドが値を返す時、その値はデフォルトフラグ(ステータスコードなど)と共にレスポンスオブジェクトにラップされている
        // レスポンスが返される前にいろいろカスタマイズするために使うのが h.response()
        const response = h.response({ be: "hapi" });

        // request.params.ttl() によりレスポンスヘッダの max-age を設定できる
        // レスポンスオブジェクトを使うことで、optionsのcacheで定義した設定も上書きできる
        if (requset.params.ttl) {
          response.ttl(requset.params.ttl);
        }

        return response;
      },
      options: {
        cache: {
          expiresIn: 30 * 1000, // max-age=30 がヘッダに追加される。30秒間ブラウザキャッシュとして残る
          privacy: "private", // 中間キャッシュではなくブラウザのみのキャッシュ
        },
      },
    },
  ]);

  await server.start();
};

start();
