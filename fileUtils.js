
var session = [];

async function list(ctx){
  
    ls(ctx).then(res =>{
 
    let f=res.split('\n');
    let col=0;
    let row=0;
    let a = [];
    for(var i=0;f[i]!=null;){
     
      for(var j=0;j<3;j++){
        if(f[i]!=null){
          a[j] = Markup.callbackButton(f[i], f[i++]+" ");
        }else{
          i++;
        }
      }
        buttonsKilled[row++]=a;
        a=[];
      
    }
     return ctx.reply('Arquivos',Markup.inlineKeyboard(buttonsKilled).extra());
    });
}

async function ls(ctx) {
    const { stdout, stderr } = await exec("ls");
    return stdout;
  }
  
  async function disk(ctx) {
    const { stdout, stderr } = await exec("df -h | egrep '^\/dev' | awk -F' '  '{print $4}'");
    ctx.reply("Espaço disponivel: (sda1) "+stdout);
  }
  
  async function load(ctx) {
    const { stdout, stderr } = await exec('sleep 3;uptime');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    ctx.reply(stdout);
  }
  
  async function start(ctx) {
    const { stdout, stderr } = await exec('cd /home/letonai/workspace/nodejs/Board;`nohup npm start;exit 0` && echo UP');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    ctx.reply("Up");
  }
  
  
   async function kill(ctx) {
    const { stdout, stderr } = await exec('cd /home/letonai/workspace/nodejs/Board;npm stop');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    ctx.reply("Down");
  }
  
exports.checkDisk =  function  (ctx){
   
   disk(ctx);
    
  }
  
exports.checkLoad =   function  (ctx){
    load(ctx);
  }
  
exports.startProcess =   function  (ctx){
    exec('cd /home/letonai/workspace/nodejs/Board;npm start');
    ctx.reply("Up");
    
  }
  
exports.killProcess =   function  (ctx){
   kill(ctx);
  }

  async function checkType(ctx,file){
    console.log(file);
    const { stdout, stderr } = await exec("file "+(session[ctx.from.id]==null?"":session[ctx.from.id].dir+"/")+file);
    var type = stdout.split(":");
    return type;
  }
  
  async function x(ctx,file,t){
        console.log("Arquivo: "+file+" "+t);
        const { stdout, stderr } = await exec((t==0?"ls ":"ls -lhtr ")+ (session[ctx.from.id]==null?"":session[ctx.from.id].dir+"/")+file);
        console.log("list: "+stdout);
        return stdout;
  }
  
  async function lsfile(ctx,file){
    
     checkType(ctx,file).then(ret => {
      if(ret[1].trim()=="directory"){
  
        var buttons = [];
        return x(ctx,"/home/letonai/workspace/telegrambot_server/server/"+(session[ctx.from.id]==null?"":session[ctx.from.id].dir+"/")+ret[0],0).then(r =>{
          let col=0;
          let row=0;
          let f = r.split('\n');
          console.log("Diretório: "+f[0]);
          let a = [];
          session[ctx.from.id]={"dir":file.trim()};
          //console.log(session[ctx.from.id]);
  
          for(var i=0;f[i]!=null;){
           
            for(var j=0;j<3;j++){
              if(f[i]!=null){
                a[j] = Markup.callbackButton(f[i], f[i++]+" ");
              }else{
                i++;
              }
            }
              buttons[row++]=a;
              a=[];
          }
          return ctx.reply('Arquivos',Markup.inlineKeyboard(buttons).extra());
          });
          
          return "Oi";
        
      }else{
        x(ctx,ret[0].trim(),1).then(r => {ctx.reply(r);});
        return "Oii";
      }
    }).catch(ret => {console.log("Erro: "+ret);});
  }