var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_dodgev',
  password        : '1696',
  database        : 'cs340_dodgev'
});
module.exports.pool = pool;
