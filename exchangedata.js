//const request = require("request");
const request = require('request-promise')
//const fetch = require('node-fetch');
//var express = require('express');
//var app = express();
var http = require('http');
var url  = require('url');

var last=17000;
var lasthtml=1;
var lasteth=1;
var lastltc=1;
var lastcheck = [];
var coinmarketcap = "";
var foxbit="";
var convert="brl"


function getExchangeData(){
  console.log("Requesting data.");
  const coinmarketcapOptions = {
    method: 'GET',
    uri: 'https://api.coinmarketcap.com/v1/ticker?convert=brl&limit=10000'
    }
    
    request(coinmarketcapOptions).then(function (body) {
      coinmarketcap = body;//JSON.parse(body);
    }).catch(function (err) {
      console.error("Erro coinmarketcap: "+err);
    })
    
    const foxbitOptions = {
    method: 'GET',
    uri: 'https://api.blinktrade.com/api/v1/BRL/ticker'
    }
    
    request(foxbitOptions).then(function (body) {
      foxbit =body;// JSON.parse(body);
      
    }).catch(function (err) {
      console.error("Erro foxbit: "+err);
    })
}
getExchangeData();
setInterval(function(){
    getExchangeData();
},60000);

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  console.log(req.url);
  if(req.url=="/foxbit"){
    res.write(foxbit.toString());
  }else{
    res.write(coinmarketcap.toString());
  }
  res.end();
}).listen(8990);