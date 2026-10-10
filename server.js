// Node.js 20+; no third-party dependencies. Keep TELEGRAM_BOT_TOKEN on server only.
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=__dirname;
const PORT=Number(process.env.PORT||3000);
const TOKEN=process.env.TELEGRAM_BOT_TOKEN;
const CHAT=process.env.TELEGRAM_CHAT_ID||'8293509366';
const limits=new Map();
const allowed=new Set(['Підтримуюче прибирання','Генеральне прибирання','Миття вікон','Прибирання після ремонту','Прибирання при виселенні']);
const rates={'Підтримуюче прибирання':49,'Генеральне прибирання':90,'Миття вікон':180,'Прибирання після ремонту':100,'Прибирання при виселенні':80};
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon'};
function send(res,code,obj){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
function clean(v,n=300){return String(v??'').replace(/[<>\u0000-\u001f]/g,' ').trim().slice(0,n);}
function esc(v){return clean(v,1000).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
async function order(req,res){
 if(!TOKEN||!CHAT)return send(res,503,{error:'Прийом заявок ще не налаштовано. Зателефонуйте нам.'});
 const ip=req.socket.remoteAddress||'unknown';const now=Date.now();for(const [k,t] of limits)if(now-t>60000)limits.delete(k);
 if(now-(limits.get(ip)||0)<15000)return send(res,429,{error:'Зачекайте 15 секунд перед наступною заявкою.'});
 let raw='';try{for await(const part of req){raw+=part;if(raw.length>12000)return send(res,413,{error:'Занадто великий запит.'});}}catch{return send(res,400,{error:'Помилка запиту.'});}
 let d;try{d=JSON.parse(raw)}catch{return send(res,400,{error:'Невірний формат даних.'})}
 if(typeof d!=='object'||!d||Array.isArray(d))return send(res,400,{error:'Невірні дані.'});
 const name=clean(d.name,100),phone=clean(d.phone,50),service=clean(d.service,100),message=clean(d.message,1500);
 if(name.length<2||!/^\+?[\d\s()\-]{9,22}$/.test(phone)||!allowed.has(service))return send(res,400,{error:'Перевірте ім’я, телефон і послугу.'});
 const area=d.area===''||d.area==null?null:Number(d.area);
 if(area!==null&&(!Number.isFinite(area)||area<1||area>10000))return send(res,400,{error:'Некоректна площа.'});
 const cost=area===null?null:Math.round(area*rates[service]);
 const txt=['🧹 <b>Нова заявка CleanLine Group</b>','👤 Ім’я: '+esc(name),'📞 Телефон: '+esc(phone),'🧽 Послуга: '+esc(service),'📐 Площа: '+(area===null?'не вказано':area+' м²'),'💰 Орієнтовна ціна: '+(cost===null?'уточнити':'від '+cost+' грн'),'💬 Коментар: '+esc(message||'—')].join('\n');
 try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
 let response;try{response=await fetch('https://api.telegram.org/bot'+TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:CHAT,text:txt,parse_mode:'HTML'}),signal:controller.signal})}finally{clearTimeout(timer)}
 const json=await response.json();if(!response.ok||!json.ok)throw Error('Telegram error');
 limits.set(ip,now);return send(res,200,{ok:true});
 }catch(e){console.error('Telegram send failed:',e.message);return send(res,502,{error:'Не вдалося надіслати заявку. Спробуйте пізніше або зателефонуйте нам.'});}
}
http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/order')return req.method==='POST'?order(req,res):send(res,405,{error:'Method not allowed'});
 if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Method not allowed'});
 const file=pathname==='/'?'index.html':decodeURIComponent(pathname).slice(1);
 const target=path.resolve(ROOT,file);
 if(!target.startsWith(ROOT+path.sep)||file.startsWith('.')||file.split('/').some(x=>x.startsWith('.'))||['server.js','README.txt','package.json'].includes(file))return send(res,404,{error:'Not found'});
 try{const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data)}catch{send(res,404,{error:'Not found'})}
}).listen(PORT,()=>console.log('CleanLine Group site running at http://localhost:'+PORT));
