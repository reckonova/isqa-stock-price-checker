'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var http = require('http');

let spc = {};

const CONNECTION_STRING = process.env.DB; //
MongoClient.connect(
  CONNECTION_STRING, 
  {useNewUrlParser:true, useUnifiedTopology:true}, 
  (err,client)=>{
    let stocks = client.db('test').collection('stocks');
    
    spc.hasLike = (ticker,ip,done) => {
      stocks.findOne({ticker: ticker}, (err, doc)=>{
        if(err){
          done(err);
        } else {
          if(!doc){
            spc.addTicker(ticker, (err,tickerDoc)=>{
              if(err){
                done(err);
              } else {
                spc.addLike(ticker, ip, (err, numLikes)=>{
                  if(err){
                    done(err);
                  } else {
                    done(null, numLikes);
                  }
                });
              }
            });
          } else if(doc.likes && doc.likes.length > 0 && doc.likes.includes(ip)){
            done(null, doc.likes.length);
          } else {
            spc.addLike(ticker, ip, (err, numLikes)=>{
              if(err){
                done(err);
              } else {
                done(null, numLikes);
              }
            });
          }
        }
      });
    };
    
    spc.addTicker = (ticker, done) => {
      stocks.insertOne({ticker:ticker,likes:[]},(err,doc)=>{
        if(err){
          done(err);
        } else {
          done(null, doc);
        }
      });
    }
    
    spc.addLike = (ticker, ip, done) => {
      stocks.findOneAndUpdate(
        {ticker: ticker}, 
        {$push : { likes: ip }},
        {returnOriginal:false}, 
        (err, doc)=>{
          if(err){
            done(err);
          } else {
            done(null, doc.value.likes.length);
          }
      });
    };
    
    spc.getTotalLikes = (ticker, done) => {
      stocks.findOne({ticker: ticker}, (err,doc)=> {
        if(err){
          console.error(err)
          done(err);
        } else {
          if(!doc){
            done(null, 0);
          } else if(doc.likes){
            done(null, doc.likes.length);
          } else {
            done(null, 0);
          }
        }
      })
    };
});

function processData(stockData, ip, addLike, done){
  http.get(`http://repeated-alpaca.glitch.me/v1/stock/${stockData.stock}/quote`, (response) => {
    let rawData = "";
    response.on('data', (d)=> { rawData += d; });
    response.on('end', ()=> {
      let json = JSON.parse(rawData);
      stockData.price = json.latestPrice.toFixed(2);
      
      if(addLike){
        spc.hasLike(stockData.stock, ip, (err,data)=>{
          if(err){
            console.error(err);
          } else {
            stockData.likes = data;
            done(null, stockData);
          }
        });
      } else {
        spc.getTotalLikes(stockData.stock, (err,data)=>{
          if(err){
            console.error(err);
          } else {
            stockData.likes = data;
            done(null, stockData);
          }
        });
      }
    });
  });
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      let data = [];
      if(typeof req.query.stock === "string"){
        data.push({
          stock: req.query.stock,
          price: null,
          likes: null
        });
      } else {
        req.query.stock.forEach(stock => data.push({
          stock: stock,
          price: null,
          rel_likes: null
        }));
      }
      let addLike = req.query.like;
      var ip = req.connection.remoteAddress;
    
    processData(data[0], ip, addLike, (err, result)=>{
      if(data.length === 1){
        res.send(result);
      } else {
        data[0] = result;
        processData(data[1], ip, addLike, (err, result)=>{
          data[1] = result;
          let relLikes = [data[0].likes - data[1].likes, data[1].likes - data[0].likes];
          delete data[0].likes;
          delete data[1].likes;
          data[0].rel_likes = relLikes[0];
          data[1].rel_likes = relLikes[1];
          res.send(data);
        });
      }
    });
  });
};
