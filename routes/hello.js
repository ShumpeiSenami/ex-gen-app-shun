var express = require('express');
const { MemoryStore } = require('express-session');
const { Result } = require('express-validator');
const { NotImplemented } = require('http-errors');
var router = express.Router();


var mysql = require('mysql');
// require('knex)({初期設定のデータ});
var knex = require('knex')({
  dialect: 'mysql',     // 使用するデータベースの種類
  connection: {         // 接続するデータベースに関する設定情報をまとめたもの
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'my-nodeapp-db',
    charset: 'utf8'
  }
});
var Bookshelf = require('bookshelf')(knex);
// モデルとはデータベースにあるテーブルを扱うためのオブジェクト
var MyData = Bookshelf.Model.extend({  //引数にモデルに関する設定情報をまとめたオブジェクトを用意
  tableName: 'mydata'
})
const { route } = require('.');

var mysql_setting = {
  host       : 'localhost',
  user       : 'root',
  passoword  : '',
  database   : 'my-nodeapp-db'
};


router.get('/', (req, res, next) => {
  // fetchAll は全てのレコードを取得する .thenはコールバック関数
  new MyData().fetchAll().then((collection) => {
      var data = {
                  title: 'Hello!',
                  content: collection.toArray()
              };
              res.render('hello/index', data);
  })
  .catch((err) => {
      res.status(500).json({error: true, data: {message: err.message}});
  });
});

// 新規作成ページへのアクセス
router.get('/add', (req, res, next) => {
  var data = {
      title: 'Hello/Add',
      content: '新しいレコードを入力：',
      form: {name:'', mail:'', age:0}
  }
  res.render('hello/add', data);
});


// 新規作成フォームの送信処理
router.post('/add', (req, res, next) => {
  // ('チェック項目', 'エラ-メッセージ')
  req.check('name','NAME は必ず入力して下さい。').notEmpty();
  req.check('mail','MAIL はメールアドレスを記入して下さい。').isEmail();
  req.check('age', 'AGE は年齢（整数）を入力下さい。').isInt();

  // バリデーションの結果を取得し非同期でバリデーション処理を実行しthenにコールバック関数を用意
  req.getValidationResult().then((result) => {
      // 受け取ったバリデーションが空でないならtrue（バリデーションのチェックに引っ掛かった場合）
      if (!result.isEmpty()) {
          var re = '<ul class="error">';
          // 受け取ったエラーメッセージを配列として取り出す
          var result_arr = result.array();
          // 配列を変数 n　に取り出してエラーメッセージの表示を作成
          for(var n in result_arr) {
              re += '<li>' + result_arr[n].msg + '</li>'
          }
          re += '</ul>';
          var data = {
              title: 'Hello/Add',
              content: re,
              form: req.body
          }
          res.render('hello/add', data);
      } else {
          var nm = req.body.name;
          var ml = req.body.mail;
          var ag = req.body.age;
          var data = {'name':nm, 'mail':ml, 'age':ag};
          
          var connection = mysql.createConnection(mysql_setting);
          connection.connect();
          connection.query('insert into mydata set ?', data, 
                  function (error, results, fields) {
              res.redirect('/hello');
          });
          connection.end();
      }
  });
});


router.get('/show', (req, res, next) => {
  var id = req.query.id;

  var connecttion = mysql.createConnection(mysql_setting);

  connecttion.connect();

  connecttion.query('SELECT * from mydata where id=?', id, function(error, results, fields){
    if(error == null){
      var data = {
        title: 'Hello/show',
        content: 'id = ' + id + 'のレコード:',
        mydata: results[0]
      }
      res.render('hello/show', data);
    }
  });
  connecttion.end();
});

router.get('/edit', (req, res, next) => {
  var id = req.query.id;
  var connection = mysql.createConnection(mysql_setting);
  connection.connect();
  connection.query('SELECT * from mydata where id=?', id,
          function (error, results, fields) {
          if (error == null) {
          var data = {
              title: 'Hello/edit',
              content: 'id = ' + id + ' のレコード：',
              mydata: results[0]
          }
          res.render('hello/edit', data);
          console.log(data);
      }
  });
  connection.end();
});

router.post('/edit', (req, res, next) => {
  var id = req.body.id;
  var nm = req.body.name;
  var ml = req.body.mail;
  var ag = req.body.age;
  var data = {'name':nm, 'mail':ml, 'age':ag};
  var connection = mysql.createConnection(mysql_setting);
  connection.connect();
  connection.query('update mydata set ? where id=?',
    [data, id], function(error, results, fields){
    console.log("id" + id);
    res.redirect('/hello');
  });
  connection.end();
});

router.get('/delete', (req, res, next) => {
  var id = req.query.id;
  var connection = mysql.createConnection(mysql_setting);
  connection.connect();

  connection.query('SELECT * from mydata where id=?', id,
    function(error, results, fields){
      if(error == null){
        var data = {
          title: 'Hello/delete',
          content: 'id= ' + id + 'のレコード',
          mydata: results[0]
        }
        res.render('hello/delete', data);
      }
    });
    connection.end();
});

router.post('/delete',(req, res, next) => {
  var id = req.body.id;

  var connection = mysql.createConnection(mysql_setting);
  connection.connect();

  connection.query('delete from mydata where id=?', id,
    function(error, results, fields){
      res.redirect('/hello');
    });
    connection.end();
});

module.exports = router;