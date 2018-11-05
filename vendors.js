module.exports = function(){
    var express = require('express');
    var router = express.Router();

// Get all fruits available
    function getFruits(res, mysql, context, complete){
        mysql.pool.query("SELECT id, type FROM fruits", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.fruits  = results;
            complete();
        });
    }

// Get all vendors and the fruits they supply
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
              var sql = "SELECT fruits.type as type, fruits.id as id FROM vendor_supplies INNER JOIN fruits ON vendor_supplies.fid = fruits.id WHERE vendor_supplies.vid = ?";
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

// Show all vendors
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getFruits(res, mysql, context, complete);
        getVendors(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('vendors', context);
            }

        }
    });

// Template to add a new vendor
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

// Remove fruit from list of fruits supplied by vendor (in vendor_supplies table)
    router.post('/addFruits', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body);
        var sql = "REPLACE INTO vendor_supplies (vid, fid) VALUES ?";
        var inserts = [];
        for (let i =0; i<req.body.fruits.length;i++){
          inserts.push([req.body.id, req.body.fruits[i]]);
        }
        sql = mysql.pool.query(sql,[inserts],function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
              res.redirect('/vendors');
            }
        });
    });

    router.get('/removefruit/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.params.id)
        var fruit = req.query.fruit;
        var vendor = req.params.id;
        console.log(fruit);
        var sql = "DELETE FROM vendor_supplies WHERE fid=? AND vid=?";
        console.log(req.body.date);
        var inserts = [fruit, vendor];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
              if(error){
                  console.log(JSON.stringify(error))
                  res.write(JSON.stringify(error));
                  res.end();
              }else{
                res.redirect('/vendors');
              }

        });
    });

    router.get('/delete/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.params.id)
        var vendor = req.params.id;
        var sql = "DELETE FROM vendors WHERE id=?";
        var inserts = [vendor];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
              if(error){
                  console.log(JSON.stringify(error))
                  res.write(JSON.stringify(error));
                  res.end();
              }else{
                res.redirect('/vendors');
              }

        });
    });

// Add a vendor, insert fruits supplied by vendor in vendor_supplies table
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

    return router;
}();
