const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav-links');if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});}

// Meta Pixel: отслеживание нажатий на контакты
document.addEventListener('click',(event)=>{
 const link=event.target.closest('a[href]');
 if(!link||typeof window.fbq!=='function')return;
 const href=link.href.toLowerCase();
 let channel='';
 if(href.startsWith('tel:'))channel='phone';
 else if(href.includes('t.me/')||href.includes('telegram.me/'))channel='telegram';
 else if(href.includes('instagram.com/'))channel='instagram';
 if(channel)window.fbq('track','Contact',{channel});
});

const form=document.querySelector('#order-form');
if(form){
 const rates={'Підтримуюче прибирання':49,'Генеральне прибирання':90,'Миття вікон':180,'Прибирання після ремонту':100,'Прибирання при виселенні':80};
 const estimate=document.querySelector('#estimate');
 function getEstimate(){const service=form.elements.service.value,area=Number(form.elements.area.value),rate=rates[service];if(rate&&area>0&&Number.isFinite(area)){const sum=area*rate;estimate.textContent=`Орієнтовна вартість: від ${sum.toLocaleString('uk-UA',{maximumFractionDigits:0})} грн (${area} м² × ${rate} грн). Точну ціну узгоджуємо перед замовленням.`;return sum;}estimate.textContent='Вкажіть послугу та площу, щоб побачити орієнтовну вартість.';return null;}
 form.elements.service.addEventListener('change',getEstimate);form.elements.area.addEventListener('input',getEstimate);
 const submitButton=form.querySelector('button[type="submit"]');
 const result=document.querySelector('#form-result');
 form.addEventListener('submit',async(e)=>{
  e.preventDefault();if(!form.reportValidity())return;
  const data=Object.fromEntries(new FormData(form));
  data.estimatedPrice=getEstimate();
  data.website='CleanLine Group';
  result.hidden=true;submitButton.disabled=true;submitButton.textContent='Надсилаємо…';
  try{
   const response=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   const body=await response.json().catch(()=>({}));
   if(!response.ok||!body.ok)throw new Error(body.error||'Не вдалося надіслати заявку. Спробуйте ще раз.');
   if(typeof window.fbq==='function')window.fbq('track','Lead');
   result.textContent='✓ Дякуємо! Вашу заявку успішно надіслано. Ми скоро зв’яжемося з вами.';
   result.style.color='#14583f';form.reset();getEstimate();
  }catch(err){result.textContent=err.message||'Помилка надсилання. Спробуйте ще раз.';result.style.color='#b42318';}
  finally{result.hidden=false;submitButton.disabled=false;submitButton.textContent='Надіслати заявку ↗';}
 });
}
