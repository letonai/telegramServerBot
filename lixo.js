/*
var express = require('express');
var app = express();
var http = require('http');
var httpServer = http.Server(app);*/
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

app.use(express.static(__dirname+'/static'));
app.get('/', (req, res) => sendAlert(req,res) )
app.post("/",(req, res) => sendAlertPost(req,res) )

bot.startPolling();

/*Telegram Options*/
bot.catch((err) => {
  console.log('Ooops', err)
})

//Actions
bot.command('/test',(ctx) => getServers(ctx));


bot.command("menu", (ctx) => {
  return ctx.reply('Keyboard wbot.command("menu", (ctx) => {rap', Extra.markup(
    //Markup.keyboard(['/btc',Markup.k('❤️', 'http://telegraf.js.org')])
    Markup.keyboard(['/disk','/load','/list'])
  ));
})

bot.on('callback_query',ctx => {
  if (AllowedUsers.indexOf(ctx.from.id) <0){
    console.log("Usuario nao autorizado!"+(ctx.from.id));
    return;
  }
  console.error("User: "+ctx.from.id);
  console.error(ctx.update.callback_query.data);
   if(ctx.update.callback_query.data.includes("alert:")){
     
     if(ctx.update.callback_query.data.includes("unsign")){
         
         if(ctx.update.callback_query.data.toString().includes("unsign:")){
          //console.log("Remove: "+ctx.update.callback_query.data+" : "+ctx.update.callback_query.data.split(":")[2]);
          storage.removeItemSync(ctx.update.callback_query.data.split(":")[2],function(){ctx.reply("Alerta removido "+ctx.update.callback_query.data);});
           ctx.answerCallbackQuery('Alerta '+ctx.update.callback_query.data.split(":")[2]+' removido');
          return "";
         }else{
          unSignMenu(ctx);
         }
      }else{
       console.log("Alerta: "+ctx.update.callback_query.data.split(":")[1]+" para usuario: "+ctx.from.id);
       var x = ctx.update.callback_query.data.split(":")[1];
       console.log("ALERTA");
       //storage.setItem("alerts",{ [x] : (ctx.from.id) });
       storage.setItem(x+ctx.from.id,{ "user" : ctx.from.id});
       storage.persist();
       ctx.answerCallbackQuery('Alerta '+x+' assinado');
      }
   }else if(ctx.update.callback_query.data.includes("start:")){
     if(ctx.update.callback_query.data.includes("menu:")){
        btMenu = [];
        
        controllerHook.getRemoteActionList(ctx.update.callback_query.data.split(":")[2]).then(function(res){
          JSON.parse(res).forEach(action => {
            btMenu.push([Markup.callbackButton(action.ACTION, 'start:'+action.ACTION+":"+ctx.update.callback_query.data.split(":")[2])]);
          });
          ctx.reply('Acoes:',Markup.inlineKeyboard(btMenu).extra());
          btPush = null;
        });

     }else{
      //console.log(ctx.update.callback_query.data)
      controllerHook.sendRemoteAction(ctx.update.callback_query.data.split(":")[2],ctx.update.callback_query.data.split(":")[1]).then(res => {
          ctx.reply('Comando enviado, aguardando resposta...');
          let now = new Date().getTime();
          var checkResult = setInterval(function(seconds=now){
          controllerHook.getRemoteactionStatus(ctx.update.callback_query.data.split(":")[2],res).then(r=> {
            //console.log((new Date().getTime())-seconds);
            JSON.parse(r).forEach(result => {
              if(result.RESULT.toString()!=""){
                //console.log(result.RESULT);
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
   }else{
   let file = ctx.update.callback_query.data;
   fileUtils.lsfile(ctx,file).then(res => {
     console.log(res+"____");
     });
   }
});
//ot.hears(/.*/i, (ctx) => {console.log(ctx.from)});
bot.on('document', (ctx) => {
  console.log(ctx.update.message.document);
  bot.telegram.getFile(ctx.update.message.document.file_id).then(file => {
      var f = fs.createWriteStream("./"+ctx.update.message.document.file_name);
      var request = https.get("https://api.telegram.org/file/bot524211964:AAEXrUGzRAqZ6cb2PGGodJgmj4D1SJtCbNA/"+file.file_path, function(response) {
      response.pipe(f).on('finish',
        ()=>{
            console.log("Terminou");
            fs.readFile("./"+ctx.update.message.document.file_name, 
          (e,d) => {
          ctx.reply("Arquivo: "+ctx.update.message.document.file_name+" MD5: "+md5(d));
            });
        });
      });
  });
});

//Markup Options
var buttonsStarted = [[Markup.callbackButton('Status', 'Status')],[Markup.callbackButton('Stop', 'stop')]];
var buttonsKilled = [];
var bAppManager = [[Markup.callbackButton('Start', 'start')],[Markup.callbackButton('Stop', 'stop')]];

//Auxiliary functions

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

/*httpServer.listen(3000, function(){
  console.log('Application sucessfull started!');
});*/