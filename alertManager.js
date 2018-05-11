const storage = require('node-persist')
const { Markup,Extra } = require('telegraf');
const request = require('request-promise')

storage.initSync({
	dir: 'bot/data',
  continuous: true,
});

/*Alert Management*/
var alerts = ["disco","carga","down","jar","unsign"];

exports.alertsMenu = function (ctx){
  let BtOption = [];
  for(var a in alerts){
    BtOption.push(Markup.callbackButton(alerts[a],"alert:"+alerts[a]));
  }
  ctx.reply("Alerts",Markup.inlineKeyboard(BtOption).extra());
}


exports.alertsMenu2 = function (ctx){
  let BtOption = [];
   let CtxOpt = [];
   BtOption.push([Markup.callbackButton("unsign","alert:unsign")]);
   ctx.reply("-",Markup.inlineKeyboard(BtOption).extra());  
   BtOption = [];
  for(var j in storage.keys()){
    if(storage.keys()[j].indexOf("alert")>=0 && CtxOpt.indexOf(storage.keys()[j].split(":")[1].toString())==-1){
      CtxOpt.push(storage.keys()[j].split(":")[1].toString());
    }
  }
  console.log(CtxOpt);
  for(var i in CtxOpt){
    for(var a in storage.keys()){
      if(storage.keys()[a].indexOf(CtxOpt[i]+":")!=-1){
        var b = storage.keys()[a].split(":")[2];
        BtOption.push([Markup.callbackButton(b,storage.keys()[a])]);
      }
    }
  ctx.reply(CtxOpt[i]+":",Markup.inlineKeyboard(BtOption).extra());  
  BtOption = [];
  }
 
}

exports.unSignMenu =function (ctx){
  ctx.answerCallbackQuery('Buscando alertas assinados...');
  var BtOption = [];
  for(var a in storage.keys()){
    if((storage.keys()[a]).indexOf(ctx.from.id)!==-1){
      console.log("Interno: alert:unsign: "+storage.keys()[a].replace(ctx.from.id,""));
      BtOption.push(Markup.callbackButton(storage.keys()[a].replace(ctx.from.id,""),"alert:unsign:"+storage.keys()[a]));
    }
  }
 
  if(BtOption.length==0){
    ctx.reply("Voce nao tem alertas assinados...");
  }else{
    ctx.reply("Desabilitar alertas: ",Markup.inlineKeyboard(BtOption).extra());
    
  }
}


exports.sendAlertPost = function (req,res){
     var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
        storage.setItem("alert:"+JSON.parse(bodyStr).from+":"+JSON.parse(bodyStr).type,{ "type" : JSON.parse(bodyStr).type});
        console.log(storage.keys());
         for(var a in storage.keys()){
          var BtOption = [];
            if((storage.keys()[a]).indexOf(JSON.parse(bodyStr).from)!==-1){
              bot.telegram.sendMessage(storage.values(req.query.type)[a].user,"Alerta: "+JSON.parse(bodyStr).from+"\n"+JSON.parse(bodyStr).message);
            }
          }
        });
    req.on("end",function(){
        res.send(bodyStr);
    });
}

exports.sendAlert=function (req,res){

 for(var a in storage.keys()){
    var BtOption = [];
    if((storage.keys()[a]).indexOf(req.query.type)!==-1){
      console.log("Request "+storage.values(req.query.type)[a].user);
      bot.telegram.sendMessage(storage.values(req.query.type)[a].user,"Alerta: "+req.query.from+"\n"+req.query.message);
    }
  }
  res.send('Ok');
  console.log(req.param.message);
}

/*setInterval(
  function(){
  for (var j in alerts){
   for ( var i in storage.valuesWithKeyMatch(alerts[j])){
     console.log("Alerta "+alerts[j]+": "+storage.valuesWithKeyMatch(alerts[j])[i].user);
     //bot.telegram.sendMessage(storage.valuesWithKeyMatch(/carga/)[i].user,"Alerta")
   }
  }
}
,10000);*/