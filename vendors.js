module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getFruits(res, mysql, context, complete){
        mysql.pool.query("SELECT id, category, type FROM fruits", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.fruits  = results;
            complete();
        });
    }

    function getVendors(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name, zip FROM vendors", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.vendors = [];

            // complete();
            var counter = 0;
            var length = results.length;
            for (let i = 0; i< length;i++){
              context.vendors[i] = {vendor: results[i]}
              var sql = "SELECT fruits.category as category, fruits.type as type FROM vendor_supplies INNER JOIN fruits ON vendor_supplies.fid = fruits.id WHERE vendor_supplies.vid = ?";
              var inserts = [results[i].id];

              mysql.pool.query(sql, inserts, function(error, results, fields){
                  if(error){
                      res.write(JSON.stringify(error));
                      res.end();
                  }
                  counter++;
                  context.vendors[i].fruits = results;
                  if (counter == length) complete();
              });
            }
        });
    }

    // function getPeoplebyHomeworld(req, res, mysql, context, complete){
    //   var query = "SELECT bsg_people.character_id as id, fname, lname, bsg_planets.name AS homeworld, age FROM bsg_people INNER JOIN bsg_planets ON homeworld = bsg_planets.planet_id WHERE bsg_people.homeworld = ?";
    //   console.log(req.params)
    //   var inserts = [req.params.homeworld]
    //   mysql.pool.query(query, inserts, function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }
    //         context.people = results;
    //         complete();
    //     });
    // }

    /* Find people whose fname starts with a given string in the req */
    // function getPeopleWithNameLike(req, res, mysql, context, complete) {
    //   //sanitize the input as well as include the % character
    //    var query = "SELECT bsg_people.character_id as id, fname, lname, bsg_planets.name AS homeworld, age FROM bsg_people INNER JOIN bsg_planets ON homeworld = bsg_planets.planet_id WHERE bsg_people.fname LIKE " + mysql.pool.escape(req.params.s + '%');
    //   console.log(query)
    //
    //   mysql.pool.query(query, function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }
    //         context.people = results;
    //         complete();
    //     });
    // }

    // function getVendor(res, mysql, context, id, complete){
    //     var sql = "SELECT vendors.id as id, name, fruits.category as category, fruits.type as type zip FROM vendors INNER JOIN vendor_supplies ON vendor_supplie.vid = vendors.id INNER JOIN fruits ON vendor_supplie.fid = fruits.id WHERE id = ?";
    //     var inserts = [id];
    //     mysql.pool.query(sql, inserts, function(error, results, fields){
    //         if(error){
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }
    //         context.person = results[0];
    //         complete();
    //     });
    // }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        // getFruits(res, mysql, context, complete);
        getVendors(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('vendors', context);
            }

        }
    });

    router.get('/new', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getFruits(res, mysql, context, complete);
        // getVendors(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('addVendor', context);
            }

        }
    });

    /*Display all people from a given homeworld. Requires web based javascript to delete users with AJAX*/
    router.get('/filter/:homeworld', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getPeoplebyHomeworld(req,res, mysql, context, complete);
        getPlanets(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('people', context);
            }

        }
    });

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getPeopleWithNameLike(req, res, mysql, context, complete);
        getPlanets(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('people', context);
            }
        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedplanet.js", "updateperson.js"];
        var mysql = req.app.get('mysql');
        getPerson(res, mysql, context, req.params.id, complete);
        getPlanets(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-person', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */
    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO vendors (name, zip) VALUES (?,?)";
        var inserts = [req.body.name, req.body.zip];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log(results.insertId);
                var vid = results.insertId;
                var counter = 0;
                var length = req.body.fruits.length;
                for (let i =0; i<length;i++){
                  var sql = "INSERT INTO vendor_supplies (fid, vid) VALUES (?,?)";
                  var inserts = [req.body.fruits[i], vid];
                  sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                      if(error){
                          console.log(JSON.stringify(error))
                          res.write(JSON.stringify(error));
                          res.end();
                      }else{
                          console.log("fruits insert" + results.insertId);
                          counter++;
                          // context.vendors[i].fruits = results;
                          if (counter == length) res.redirect('/vendors');
                      }
                  });
                }
            }
        });
    });
    // router.post('/', function(req, res){
    //     console.log(req.body.homeworld)
    //     console.log(req.body)
    //     var mysql = req.app.get('mysql');
    //     var sql = "INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES (?,?,?,?)";
    //     var inserts = [req.body.fname, req.body.lname, req.body.homeworld, req.body.age];
    //     sql = mysql.pool.query(sql,inserts,function(error, results, fields){
    //         if(error){
    //             console.log(JSON.stringify(error))
    //             res.write(JSON.stringify(error));
    //             res.end();
    //         }else{
    //             res.redirect('/people');
    //         }
    //     });
    // });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE bsg_people SET fname=?, lname=?, homeworld=?, age=? WHERE character_id=?";
        var inserts = [req.body.fname, req.body.lname, req.body.homeworld, req.body.age, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM bsg_people WHERE character_id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();
