/*
 *
 *
 *       Complete the handler logic below
 *
 *
 */
var MongoClient = require('mongodb');
const CONNECTION_STRING = process.env.DB;
var request = require('request');

function StockHandler() {
  this.getData = function(stock, callback) {
    var result;
    console.log(stock);

    request(
      `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`,
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);

          callback('stockData', {
            stock: result.symbol,
            price: result.latestPrice
          });
        } else {
          console.log('issue!');
          callback('stockData', { error: 'external source error' });
        }
      }
    );
  };

  this.loadLikes = function(stock, like, ip, callback) {
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if(err) console.log(err);
      var collection = db.collection('stock_likes');
      if (!like) {
        collection.find({ stock: stock }).toArray(function(err, doc) {
          var likes = 0;
          if (doc.length > 0) {
            likes = doc[0].likes.length;
          }
          callback('likeData', { stock: stock, likes: likes });
        });
      } else {
        collection.findAndModify(
          { stock: stock },
          [],
          { $addToSet: { likes: ip } },
          { new: true, upsert: true },
          function(err, doc) {
            callback('likeData', {
              stock: stock,
              likes: doc.value.likes.length
            });
          }
        );
      }
    });
  };
}

module.exports = StockHandler;
