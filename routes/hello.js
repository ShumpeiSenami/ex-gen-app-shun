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
  var response = res;
  new MyData(req.body).save().then((model) => {
    response.redirect('/hello');
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

router.get('/find', (req, res, next) => {
  var data = {
    title: '/Hello/Find',
    content: '検索IDを入力',
    form: {fstr:''},
    mydata:null
  };
  res.render('hello/find', data);

});

router.post('/find',(req, res, next) => {
  // .where(項目名 , 比較する記号, 値) → req.body.fstrとidの値が等しいレコードだけが見つかる
  new MyData().where('id', '=', req.body.fstr).fetch().then((collection) => {
    var data = {
      title: 'Hello',
      content: '※id = ' + req.body.fstr + 'の検索結果:',
      form: req.body,
      mydata: collection
    };
    res.render('hello/find', data);
    console.log(data);
  })
  .catch((err) => {
    res.status(500).json({error: true, data: {message: err.message}});
  });
});

module.exports = router;