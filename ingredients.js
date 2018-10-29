module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* Adds a fruit, redirects to the vendors add page after adding */
    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO ingredients (item) VALUES (?)";
        var inserts = [req.body.item];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/recipes/new')
            }
        });
    });

    return router;
}();
