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

// app.get('/addVendor',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.fruits = fruits;
//   context.category = category;
//   res.render('addVendor',context);
// });

// app.post('/addVendor',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   res.render('vendors',context);
// });

// app.get('/vendors',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.vendors = vendors;
//   context.fruits = fruits;
//   res.render('vendors',context);
// });

// app.get('/vendor/:id',function(req,res,next){
//   var context = {};
//   var vendor = req.params.id;
//   context.title = "Get Brewing!";
//   res.render('vendor',context);
// });

// app.get('/newRecipe',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.ingredients = ingredients;
//   res.render('newRecipe',context);
// });
//
// app.post('/newRecipe',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.ingredients = ingredients;
//   res.render('recipes',context);
// });

// app.get('/recipes',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.recipes = recipes;
//   res.render('recipes',context);
// });
// app.get('/new',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.recipes = recipes;
//   res.render('new',context);
// });

// 
//
// app.get('/newBatch',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.recipes = recipes;
//   context.fruits = fruits;
//   context.vendors = vendors;
//   res.render('newBatch',context);
// });
//
// app.post('/newBatch',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   res.render('batches',context);
// });
//
// app.get('/batches',function(req,res,next){
//   var context = {};
//   context.title = "Get Brewing!";
//   context.batches = batches;
//   context.recipes = recipes;
//   context.fruits = fruits;
//   context.vendors = vendors;
//   res.render('batches',context);
// });
//
// app.get('/batch/:id',function(req,res,next){
//   var context = {};
//   var id = req.params.id;
//   context.batch = batch[id]
//   res.render('batch',context);
// });
// app.get('/tree',function(req,res,next){
//   var context = {};
//   context.title = "Create Your Family Tree"
//   if(!req.session.info){
//     req.session.reference = false;
//     req.session.parents = [false,false];
//     req.session.grandParents = [false, false, false, false];
//   }
//   context.parents = req.session.parents;
//   context.grandParents = req.session.grandParents;
//   context.reference = req.session.reference;
//   context.count = 8;
//   res.render('tree',context);
// });
//
// app.post('/tree',function(req,res,next){
//   var context = {};
//   if(!req.session.info){
//     req.session.reference = false;
//     req.session.parents = [false,false];
//     req.session.grandParents = [false, false, false, false];
//   }
//   if(req.body['New Tree']){
//     req.session.info = false;
//     req.session.reference = false;
//     req.session.parents = [false,false];
//     req.session.grandParents = [false, false, false, false];
//     context.parents = req.session.parents;
//     context.grandParents = req.session.grandParents;
//     context.reference = req.session.reference;
//     res.render('tree',context);
//   }
//
//   if(req.body['Submit']){
//     req.session.info = true;
//     req.session.reference = createPerson(req.session.reference, req.body.refName, req.body.refDesc, req.body.refB, req.body.refM, req.body.refD);
//     for (let i =0; i<2; i++){
//       req.session.parents[i] = createPerson(req.session.parents[i], req.body["parName" + i], req.body["parDesc" + i], req.body["parB" + i], req.body["parM" + i], req.body["parD" + i]);
//     }
//     for (let i =0; i<4; i++){
//       req.session.grandParents[i] = createPerson(req.session.grandParents[i], req.body["gparName" + i], req.body["gparDesc" + i], req.body["gparB" + i], req.body["gparM" + i], req.body["gparD" + i]);
//     }
//     res.redirect('/showTree');
//   }
// });
//
// app.get('/showTree',function(req,res,next){
//   var context = {};
//   context.title = "Family Tree"
//   if(!req.session.info){
//     req.session.reference = false;
//     req.session.parents = [false,false];
//     req.session.grandParents = [false, false, false, false];
//   }
//   context.parents = req.session.parents;
//   context.grandParents = req.session.grandParents;
//   context.reference = req.session.reference;
//   res.render('showTree',context);
// });

// app.get('/contact',function(req,res,next){
//   var context = {};
//   context.title = "Contact"
//   res.render('contact',context);
// });
//
// app.get('/about',function(req,res,next){
//   var context = {};
//   context.title = "About"
//   res.render('about',context);
// });


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
