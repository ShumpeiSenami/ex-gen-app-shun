var express = require('express');
const { MemoryStore } = require('express-session');
const { NotImplemented } = require('http-errors');
var router = express.Router();

var mysql = require('mysql');
const { route } = require('.');

var mysql_setting = {
  host       : 'localhost',
  user       : 'root',
  passoword  : '',
  database   : 'my-nodeapp-db'
};


router.get('/',(req, res, next) => {
  var connecttion = mysql.createConnection(mysql_setting);
  connecttion.connect();

  connecttion.query('SELECT * from mydata',
    function(error, results, fields){
      // 発生したerrorがnullであるならば真=エラーがなければ
      if(error == null){
        var data = {title:'mysql', content:results};
        res.render('hello/index', data);
      }
    });

    connecttion.end();
});

router.get('/add', (req, res, next) => {
  var data = {
    title: 'Hello/Add',
    content: '新しいレコードを入力：'
  }
  res.render('hello/add', data);
});

router.post('/add', (req, res, next) => {
  var nm = req.body.name;
  var ml = req.body.mail;
  var ag = req.body.age;
  var data = {'name':nm, 'mail':ml, 'age':ag};

  var connecttion = mysql.createConnection(mysql_setting);
  connecttion.connect();

  connecttion.query('insert into mydata set ?', data, function(error, results, fields){
    res.redirect('/hello');
  });
  connecttion.end();
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