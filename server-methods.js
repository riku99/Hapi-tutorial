// server methodは関数をシェアするのに便利な方法である
// これはモジュールをreqiuieするのではなくserverオブジェクトにアタッチすることで実現する
// また、これはキャッシュ目的でめっちゃ使われる
// server methodsを使うためには server.methods()を使う
// 呼び出す際の型は2通りある
// server.method(name, method, [options]) と server.method(method) 後者のmethodは name, method, optionsを含むオブジェクト

const Hapi = require("@hapi/hapi");

const server = Hapi.server({
  port: 4000,
  host: "localhost",
});

// server.method(method) 後者のmethodは name, method, optionsを含むオブジェクト
const add = (x, y) => {
  return x + y;
};

// serverオブジェクトに登録
// 後からserverオブジェクトから server.methods[name] で取れる
server.method({
  name: "add",
  method: add,
  options: {},
});

// nameをネストさせる形で登録
// . をnameに加えた場合はネストされたオブジェクトとして登録される
// server.methods.math.add
server.method({
  name: "math.add",
  method: add,
  options: {},
});

class DB {
  constructor(name) {
    this.name = name;
  }
}

const myDb = new DB("r");

// hapiの大きなメリットはネイティブキャッシュを使えるところである
// cacheオプションを渡したらキャッシュの設定可能
// 指定したメソッドの返り値がキャッシュされ、再実行されなくてすむ
server.method("cache.add", add, {
  cache: {
    expiresIn: 60000,
    staleIn: 30000, // キャッシュが古くなったと判断され、再生成が試みられるタイム
    staleTimeout: 10000, // 新しい値を生成している間に、古い値を返すまでの待ち時間
    generateTimeout: 100, // タイムアウトエラー。タイムアウトになった場合でも値が返された場合それはキャッシュされる
  },
  bind: myDb, // 登録した関数のthisをバインドする。addの中でthisが使われる場合はmyDbにアクセスされることになる
});
