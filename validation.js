"use strict";
const Hapi = require("@hapi/hapi");
const Joi = require("joi"); // hapiのバリデーションは基本的にJoiを使って実現している

const books = [
  {
    title: "基礎から始めるTypeScript",
  },
  {
    title: "Hapi上級",
  },
];

const bookSchema = Joi.object({
  title: Joi.string().required(),
});

const start = async () => {
  const server = Hapi.server({
    port: 4000,
    host: "localhost",
  });

  // ルートハンドラにバリデーションを追加
  // optionsのvalidateを使う。関数を渡すことも可能だが、Joiのオブジェクトを使った方がいろいろいい
  server.route([
    {
      path: "/hello/{name}",
      method: "GET",
      handler: (req, h) => {
        return `Hello ${req.params.name}`;
      },
      options: {
        validate: {
          // paramsのバリデーションであることを表す
          params: Joi.object({
            // paramsのnameがstringであり、最小3文字、最大10文字であることを表す
            name: Joi.string().min(3).max(10),
          }),
        },
      },
    },
    {
      method: "POST",
      path: "/post",
      handler: (req, h) => {
        return "Post added";
      },
      options: {
        validate: {
          payload: Joi.object({
            post: Joi.string().min(1).max(140),
            date: Joi.date().required(),
          }),
          headers: Joi.object({
            cookie: Joi.string().required(),
          }),
          options: {
            allowUnknown: true, // headersで指定した以外のヘッダはバリデーションなしで受け入れる
          },
        },
      },
    },
    {
      method: "GET",
      path: "/books",
      handler: (req, h) => {
        return books;
        // return "books" // options.response.schemaと一致しないのでエラー返される
      },
      options: {
        // レスポンスのバリデーションもここで指定することができる
        response: {
          schema: Joi.array().items(bookSchema), // レスポンスのスキーマ。bookSchemaの配列であることを表すs
          failAction: "error", // スキーマと異なっていた場合どうするかの指定。errorだとエラー返す
        },
      },
    },
  ]);

  await server.start();

  console.log("サーバー起動: " + server.info.uri);
};

start();
