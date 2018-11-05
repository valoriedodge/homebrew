module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getIngredients(res, mysql, context, complete){
        mysql.pool.query("SELECT id, item FROM ingredients", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.ingredients  = results;
            complete();
        });
    }

    function getRecipeIngredients(id, res, mysql, context, complete){
        var sql = "SELECT id, item, quantity FROM ingredients INNER JOIN recipe_ingredients ON recipe_ingredients.iid = ingredients.id WHERE recipe_ingredients.rid = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.ringredients  = results;
            complete();
        });
    }

    function getRecipe(id, res, mysql, context, complete){
        var sql = "SELECT id, name, directions FROM recipes WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.recipe  = results[0];
            complete();
        });
    }


    function getRecipes(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name, directions FROM recipes", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.recipes = results;
            complete();
        });
    }


    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        // getFruits(res, mysql, context, complete);
        getRecipes(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('recipes', context);
            }

        }
    });

    router.get('/new', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getIngredients(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('newRecipe', context);
            }

        }
    });


    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        var recipeid = req.params.id;
        var mysql = req.app.get('mysql');
        getRecipe(recipeid, res, mysql, context, complete);
        getRecipeIngredients(recipeid, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.send(context);
            }

        }
    });


    /* Adds a person, redirects to the people page after adding */
    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO recipes (name, directions) VALUES (?, ?)";
        var inserts = [req.body.name, req.body.directions];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log(results.insertId);
                var rid = results.insertId;
                var counter = 1;
                var length = 9;
                // Loop through the number of ingredients from form
                for (let i =1; i<length;i++){
                  var iid = req.body["ingredients" + i]
                  console.log(iid);
                  // Add to recipe if there is a given value for the ingredient
                  if (iid){
                      var quantity = req.body["quantity" + i] + " " + req.body["measurement" + i]
                      var sql = "INSERT INTO recipe_ingredients (rid, iid, quantity) VALUES (?,?, ?)";
                      var inserts = [rid, iid, quantity];
                      sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                          if(error){
                              console.log(JSON.stringify(error))
                              res.write(JSON.stringify(error));
                              res.end();
                          }else{
                              counter++;
                              if (counter == length) res.redirect('/recipes');
                          }
                      });
                    } else{
                      counter++;
                      if (counter == length) res.redirect('/recipes');
                    }
                  }
              }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.get('/update/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        var recipeid = req.params.id;
        var mysql = req.app.get('mysql');
        getIngredients(res, mysql, context, complete);
        getRecipe(recipeid, res, mysql, context, complete);
        getRecipeIngredients(recipeid, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('updateRecipe',context);
            }

        }
    });

    router.post('/update/:id', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "UPDATE recipes SET name=?, directions=? WHERE id=?";
        var inserts = [req.body.name, req.body.directions, req.params.id];
        var rid = req.params.id;
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                var counter = 1;
                var length = Number(req.body.numIng) + 1;
                // Loop through the number of ingredients from form
                for (let i =1; i<length;i++){
                  var iid = req.body["ingredients" + i]
                //   // Add to recipe if there is a given value for the ingredient
                  if (iid){
                      var quantity = req.body["quantity" + i] + " " + req.body["measurement" + i]
                      var sql = "INSERT INTO recipe_ingredients (rid, iid, quantity) VALUES (?,?, ?)";
                      var inserts = [rid, iid, quantity];
                      sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                          if(error){
                              console.log(JSON.stringify(error))
                              res.write(JSON.stringify(error));
                              res.end();
                          }else{
                              counter++;
                              if (counter == length) res.redirect('/recipes');
                          }
                      });
                    } else{
                      break;
                    }
                  }
                //   console.log("*****************************");
                  res.redirect('/recipes');
              }
        });
    });

    router.get('/delete/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM recipes WHERE id=?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
              if(error){
                  console.log(JSON.stringify(error))
                  res.write(JSON.stringify(error));
                  res.end();
              }else{
                res.redirect('/recipes');
              }

        });
    });

    return router;
}();
