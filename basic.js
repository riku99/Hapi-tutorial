"use strict";

const Bcrypt = require("bcrypt"); // bcryptは外部ライブラリ。NodeAPIとして提供されているものだとおもってた
const Hapi = require("@hapi/hapi");

const users = {
  sutehage: {
    username: "sutehage",
    password: "$2b$10$XE4P63hoWxzA7t7iq25LMOevjdfLsiih/SFOSEIy66m1ZG8DVKDTy", // kimotile のシークレット
    name: "sute hage",
    id: 1,
  },
};

// @hapi/basicに使うバリデーション関数
// @hapi/basicにより表示されるbasic用フォームから入力した値が username, password の位置に渡される
// @hapi/basicの仕様上 {isValid, credentials} を返さなければいけない
const validate = async (request, username, password) => {
  const user = users[username];
  if (!user) {
    return { credentials: null, isValid: false };
  }

  const isValid = await Bcrypt.compare(password, user.password);
  const credentials = { id: user.id, name: user.name };

  return { isValid, credentials };
};

const start = async () => {
  const server = Hapi.server({ port: 4000 });

  // "basic"という名前のschemeの登録。内部的に server.auth.scheme() が実行。
  // schemeは function (server, options) となっている。serverはserverインスタンスの参照で、optionsは後にstrategyを作成する時に渡すオブジェクト
  await server.register(require("@hapi/basic"));

  // schemeを指定し、使うためのインスタンス
  // "simple"というstrategyを作成。上で登録した"basic"がschemeとして使用。スキームに渡すオブジェクト(validate)を渡す。これによりスキームの動作を設定することができる
  // @hapi/basic の使用で onpitonsには {validate} を渡さなければいけない。かつこれはfunction
  // schemeの戻り値はhapiの使用通り {authenticate: function(request, h) => h.authenticated({ credentials })}
  server.auth.strategy("simple", "basic", { validate });

  // ルーティングオブジェクトに optioins: {auth} を指定しなくても全てのルーティングでsimpleが実行される
  server.auth.default("simple");

  server.route([
    {
      method: "GET",
      path: "/",
      options: {
        auth: "simple",
      },
      handler: function (request, h) {
        // {
        //   isAuthenticated: true,
        //   isAuthorized: false,
        //   isInjected: false,
        //   credentials: { id: 1, name: 'sute hage' },
        //   artifacts: undefined,
        //   strategy: 'simple',
        //   mode: 'required',
        //   error: null
        // }
        console.log(request.auth); // 上記オブジェクトを取得できる
        return "welcom";
      },
    },
    {
      // auth.defaultにより optins: {auth} 設定していなくても simple が実行される
      method: "GET",
      path: "/defo",
      handler: (req, h) => {
        return { result: true };
      },
    },
    {
      method: "GET",
      path: "/not-basic",
      options: {
        auth: false,
      },
      handler: (req, h) => {
        return "basic認証なしじゃ";
      },
    },
  ]);

  await server.start();

  console.log("server running at: " + server.info.uri);
};

start();
