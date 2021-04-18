// hapiにはアプリケーションを簡単に拡張子たりビジネスロジックを分割したりするためのプラグインを加えることもできるし、作ることもできる
// プラグインは簡単でなもので、registerプロパティを持ったオブジェクトである
// そしてこのプロパティは async function (server, options) となっている
// 加えてnameプロパティを持っている必要がある

"use strict";
const Hapi = require("@hapi/hapi");

const myPlugin = {
  name: "myPlugin",
  version: "1.0.0",
  // serverはサーバーの参照、optionsはoptionsプロパティで設定された値が入る
  register: async (server, options) => {
    // 例としてルートを作成するプラグインにする
    server.route({
      method: "GET",
      path: "/test",
      handler: (request, h) => {
        const name = options.name;
        return `hello ${name}`;
      },
    });
  },
};

// myPluginをserver起動時に登録することで /test にアクセスするとルーティングされる
const start = async () => {
  const server = Hapi.server({
    port: 4003,
    host: "localhost",
  });

  // 複数のプラグインを登録するには配列にオブジェクトを渡すようにする
  await server.register({
    plugin: myPlugin,
    // optioinsを指定することで、myPluginのregisterのoptionsにこの値が入る
    options: {
      name: "Riku",
    },
  });

  server.start();
};

start();
