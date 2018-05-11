const request = require('request-promise')
const Telegraf = require('telegraf');
const { reply } = Telegraf;
const { Markup,Extra } = Telegraf
const storage = require('node-persist')
const bot = new Telegraf("524211964:AAEXrUGzRAqZ6cb2PGGodJgmj4D1SJtCbNA");
const alertManager = require('./alertManager')
const fileUtils = require('./fileUtils')
const controllerHook = require('./controllerHook');

var https = require('https');
var fs = require('fs');
const md5 = require('md5');
const cmdTimeout = 60000;
const AllowedUsers = "94530844,168282535"

bot.startPolling();

/*Telegram Options*/
bot.catch((err) => {
  console.log('Ooops', err)
})

//Actions
bot.command('/listServers',(ctx) => getServers(ctx));

bot.on('callback_query',ctx => {
  if (AllowedUsers.indexOf(ctx.from.id) <0){
    console.log("Usuario nao autorizado!"+(ctx.from.id));
    return;
  }

if(ctx.update.callback_query.data.includes("start:")){
     if(ctx.update.callback_query.data.includes("menu:")){
        serversMenu(ctx);
      }else{
        sendAction(ctx);
      }
    }else{
      bot.telegram.sendMessage(ctx.from.id,"Comando nao reconhecido...");
    }
  });

//Auxiliary functions
async function serversMenu(ctx){
  btMenu = [];
  controllerHook.getRemoteActionList(ctx.update.callback_query.data.split(":")[2]).then(function(res){
    JSON.parse(res).forEach(action => {
      btMenu.push([Markup.callbackButton(action.ACTION, 'start:'+action.ACTION+":"+ctx.update.callback_query.data.split(":")[2])]);
    });
    ctx.reply('Acoes:',Markup.inlineKeyboard(btMenu).extra());
    btPush = null;
  });
}

async function sendAction(ctx){
  controllerHook.sendRemoteAction(ctx.update.callback_query.data.split(":")[2],ctx.update.callback_query.data.split(":")[1]).then(res => {
    ctx.reply('Comando '+ctx.update.callback_query.data.split(":")[1]+' enviado, aguardando resposta...');
    let now = new Date().getTime();
    var checkResult = setInterval(function(seconds=now){
    controllerHook.getRemoteactionStatus(ctx.update.callback_query.data.split(":")[2],res).then(r=> {
    JSON.parse(r).forEach(result => {
      if(result.RESULT.toString()!=""){
          bot.telegram.sendMessage(ctx.from.id,'<pre>'+result.RESULT+'</pre>',Extra.HTML(true));
          clearInterval(checkResult);
        }
        if(((new Date().getTime())-seconds)>cmdTimeout){
          console.log("Cancelado...");
          bot.telegram.sendMessage(ctx.from.id,'O comando não retornou a tempo... cancelado.');
          clearInterval(checkResult);
        }
      });
    });
  },1000)
  }).catch(function(e){
  bot.telegram.sendMessage(ctx.from.id,'Erro ao conectar com o Controller:\n'+"<code>"+e+"</code>",Extra.HTML(true));
  });
}

async function getServers(ctx){
  if (AllowedUsers.indexOf(ctx.from.id) <0){
    console.log("Usuario nao autorizado!"+(ctx.from.id));
    return;
  }
  var servers = [];
  var btServers = [];
  controllerHook.getAgents().then(function(res){
      JSON.parse(res).forEach(srv => {
      if(servers.indexOf(srv.SERVERNAME)==-1){
        btServers.push([Markup.callbackButton(srv.SERVERNAME.split(".")[0], 'start:menu:'+srv.SERVERNAME)]); 
        servers.push(srv.SERVERNAME);
      }
    });
    servers = null;
    ctx.reply('Servidores:',Markup.inlineKeyboard(btServers).extra());
  });
}