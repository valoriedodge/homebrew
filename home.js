var express = require('express');
var mysql = require('./dbcon.js');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');

var category = ["apple", "pear", "plum"];
var fruits = ["Gala Apple", "Asian Pear", "Golden Delicious Apples", "Black Plums","Jonigold Apples"];
var vendors = ["Ace Apples", "John's Farm", "Walmart", "HEB"];
var ingredients = ["Apple Must","Pear Must","Plum Must","Raspberry Juice","Sugar","Honey","Yeast"];
var recipes = ["Sweet Cider","Summer Cider","Dry Pear","Plummy"];
var batches = [1,2,3,4,5];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret:'SecretPassword'}));
app.use(express.static('assets'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6966);
app.set('mysql', mysql);
app.use('/vendors', require('./vendors.js'));
app.use('/batches', require('./batches.js'));
app.use('/recipes', require('./recipes.js'));
app.use('/fruits', require('./fruits.js'));
app.use('/ingredients', require('./ingredients.js'));


app.get('/',function(req,res,next){
  var context = {};
  context.title = "Home Brewing";
  res.render('home',context);
});


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
