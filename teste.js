//const request = require("request");
const request = require('request-promise')
const storage = require('node-persist')
const Telegraf = require('telegraf');
const { reply } = Telegraf;
const { Markup,Extra } = require('telegraf');


storage.init( /* options ... */ );
storage.initSync();
//storage.init*/( /* options ... */ ).then(function() {
  //then start using it
/*  storage.setItem('name','yourname').then(function() {
    return storage.getItem('name')
  }).then(function(value) {
    console.log(value); // yourname
  })
});
*/
var value=storage.getItem('name');
console.log("Nome: "+value);
function getData(c){
    
    const options = {
      method: 'GET',
      uri: 'https://api.coinmarketcap.com/v1/ticker?convert=brl'
    }

   request(options).then(function (body) {
      var coins=JSON.parse(body);
    for(var coin in coins ){
        if(coins[coin].symbol==c.toLocaleUpperCase()){
            console.log(c.toLocaleUpperCase()+" "+coins[coin].price_brl);
        }
    }
  }).catch(function (err) {
    console.error("Erro: "+err);
  })
  
}

//getData("btc");s
setInterval(function(){
console.log(Math.floor(Date.now()/1000)+" : "+Math.random().toString().split(".")[1]);
},5000);



