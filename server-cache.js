"use strict";

const Hapi = require("@hapi/hapi");
const CatboxRedis = require("@hapi/catbox-redis");

process.on("unhandledRejection", (reason) => {
  console.error(`unhandledRejection ${reason}`);
});

// server-side-cacheはcatboxというプラグインを使うといい。(他にもある)
// catboxにはlow-levelなClient. High-levelなPolicyという二つのインターフェースを使用する。
// Clientの使用
const server = Hapi.server({
  port: 4002,
  cache: [
    {
      name: "my_cache", // _my_cache という名前の「catboxクライアント」を作成
      provider: {
        constructor: CatboxRedis,
        options: {
          partition: "my_cache_data", // cacheのname。redisで作成した場合はこれがキープレフィックスになる
          host: "redis-cluster.domain.com",
          port: 6379,
          database: 0,
          tls: {},
        },
      },
    },
  ],
});

//Policy
// Policyをclientを用いて使う
// ただ、ドキュメント通りやってもRedisの方で connection error が出てしまい結構調べたがうまくいかないのでいったん保留
const start = async () => {
  const server = Hapi.server();

  const add = async (a, b) => {
    await Hoek.wait(1000);

    return Number(a) + Number(b);
  };

  const sumCache = server.cache({
    cache: "my_cache",
    expiresIn: 10 * 1000,
    segment: "customSegment",
    generateFunc: async (id) => {
      return await add(id.a, id.b);
    },
    generateTimeout: 2000,
  });

  server.route({
    path: "/add/{a}/{b}",
    method: "GET",
    handler: async (request, h) => {
      const { a, b } = request.params;
      const id = `${a}:${b}`;

      return await sumCache.get({ id, a, b });
    },
  });

  await server.start();

  console.log("サーバ起動" + server.info.uri);
};

start();
