(function(){
"use strict";
var KEY="la281_barberos_demo_v1";
var MXN=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:2});
var $=function(id){return document.getElementById(id)};
var activePage="inicio",range="today",kind="all",cart=[],currentRole="admin",store=load();
function id(prefix){return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7)}
function todayOffset(n){var d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d.toISOString()}
function initial(){
 var staff=[{id:"b1",name:"Barbero A",commission:40,tone:"gold",active:true},{id:"b2",name:"Barbero B",commission:45,tone:"blue",active:true},{id:"b3",name:"Barbero C",commission:40,tone:"green",active:true}];
 var items=[{id:"s1",name:"Corte de cabello",type:"servicio",price:150,active:true},{id:"s2",name:"Corte + exfoliación",type:"servicio",price:250,active:true},{id:"s3",name:"Corte + barba",type:"servicio",price:250,active:true},{id:"s4",name:"Servicio VIP",type:"servicio",price:350,active:true},{id:"s5",name:"Exfoliación",type:"servicio",price:100,active:true},{id:"s6",name:"Delineado de ceja",type:"servicio",price:50,active:true},{id:"s7",name:"Grecas",type:"servicio",price:null,active:true},{id:"p1",name:"Pomadas y ceras",type:"producto",price:null,active:true}];
 var sample=[[-6,"b1",["s1"],"efectivo","cobrado"],[-6,"b2",["s2"],"transferencia","cobrado"],[-5,"b3",["s4"],"efectivo","cobrado"],[-4,"b1",["s1","s6"],"efectivo","cobrado"],[-3,"b2",["s3"],"tarjeta","cobrado"],[-2,"b3",["s1","s5"],"efectivo","cobrado"],[-1,"b1",["s4"],"transferencia","cobrado"],[0,"b1",["s1","s6"],"efectivo","cobrado"],[0,"b2",["s2"],"transferencia","cobrado"],[0,"b3",["s1"],"efectivo","pendiente"],[0,"b2",["s1"],"tarjeta","cobrado"]];
 var sales=sample.map(function(e,i){var barber=staff.find(function(b){return b.id===e[1]});var lines=e[2].map(function(i){var x=items.find(function(p){return p.id===i});return {itemId:i,name:x.name,type:x.type,price:x.price,qty:1}});return {id:"demo_"+(i+1),date:todayOffset(e[0]),barberId:e[1],barberName:barber.name,commissionRate:barber.commission,lines:lines,client:"",note:"Muestra ilustrativa",method:e[3],status:e[4],tip:0,example:true}});
 return {staff:staff,items:items,sales:sales};
}
function load(){try{var v=JSON.parse(localStorage.getItem(KEY));if(v && Array.isArray(v.staff)&&Array.isArray(v.items)&&Array.isArray(v.sales))return v}catch(e){}return initial()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){toast("El navegador no permitió guardar los datos");}}
function escapeHtml(s){return String(s===undefined||s===null?"":s).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]})}
function money(n){return MXN.format(Number(n)||0)}
function getStaff(i){return store.staff.find(function(b){return b.id===i})}
function getItem(i){return store.items.find(function(p){return p.id===i})}
function total(s){return s.lines.reduce(function(a,l){return a+l.price*l.qty},0)+Number(s.tip||0)}
function subtotal(s){return s.lines.reduce(function(a,l){return a+l.price*l.qty},0)}
function commission(s){if(s.status!=="cobrado")return 0;return s.lines.filter(function(l){return l.type==="servicio"}).reduce(function(a,l){return a+l.price*l.qty},0)*Number(s.commissionRate||0)/100}
function dateText(date){return new Date(date).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"})}
function dateKey(d){var x=new Date(d);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-")}
function isInRange(s){if(range==="all")return true;var end=new Date();end.setHours(23,59,59,999);var start=new Date();start.setHours(0,0,0,0);if(range==="week")start.setDate(start.getDate()-6);if(range==="month")start.setDate(start.getDate()-29);return new Date(s.date)>=start && new Date(s.date)<=end}
function roleSales(){return store.sales.filter(function(s){return currentRole==="admin"||s.barberId===currentRole})}
function scopedSales(){return roleSales().filter(isInRange)}
function toast(message){var el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window._la281Toast);window._la281Toast=setTimeout(function(){el.classList.remove("show")},3500)}
function page(name){if(currentRole!=="admin" && (name==="equipo"||name==="catalogo"))name="inicio";activePage=name;document.querySelectorAll(".page").forEach(function(el){el.classList.toggle("active",el.id==="page-"+name)});document.querySelectorAll(".nav-link").forEach(function(b){b.classList.toggle("active",b.dataset.page===name)});var titles={inicio:"Centro de control",registro:"Nuevo servicio",equipo:"Gestión de barberos",catalogo:"Servicios y productos",historial:"Historial de movimientos"};$("page-title").textContent=titles[name];$("sidebar").classList.remove("open");$("mobile-overlay").classList.remove("open");render();window.scrollTo({top:0,behavior:"smooth"})}
function renderRoles(){var prev=currentRole;var sel=$("role");sel.innerHTML='<option value="admin">Propietario</option>'+store.staff.filter(function(b){return b.active}).map(function(b){return '<option value="'+escapeHtml(b.id)+'">Barbero: '+escapeHtml(b.name)+'</option>'}).join("");if(prev!=="admin"&&!store.staff.some(function(b){return b.active&&b.id===prev}))currentRole="admin";sel.value=currentRole;document.querySelectorAll(".admin-only").forEach(function(el){el.style.display=currentRole==="admin"?"":"none"});$("seller").disabled=currentRole!=="admin";if(currentRole!=="admin")$("seller").value=currentRole}
function renderDashboard(){
 var ss=scopedSales(),collected=ss.filter(function(s){return s.status==="cobrado"}),pending=ss.filter(function(s){return s.status==="pendiente"});
 $("kpi-income").textContent=money(collected.reduce(function(a,s){return a+total(s)},0));
 $("kpi-count").textContent=ss.reduce(function(a,s){return a+s.lines.filter(function(l){return l.type==="servicio"}).reduce(function(b,l){return b+l.qty},0)},0);
 $("kpi-comm").textContent=money(collected.reduce(function(a,s){return a+commission(s)},0));
 $("kpi-pending").textContent=money(pending.reduce(function(a,s){return a+total(s)},0));
 var sales7=[];for(var d=6;d>=0;d--){var day=new Date();day.setDate(day.getDate()-d);var key=dateKey(day);sales7.push({day:day.toLocaleDateString("es-MX",{weekday:"short"}).replace(".",""),amount:roleSales().filter(function(s){return s.status==="cobrado"&&dateKey(s.date)===key}).reduce(function(a,s){return a+total(s)},0)})}
 var max=Math.max.apply(null,sales7.map(function(x){return x.amount}).concat([100]));
 $("bar-chart").innerHTML=sales7.map(function(d){return '<div class="bar-col"><div class="bar-amount">'+(d.amount?money(d.amount):"—")+'</div><div class="bar-body" style="height:'+Math.max(2,Math.round(d.amount/max*135))+'px"></div><div class="bar-day">'+escapeHtml(d.day)+'</div></div>'}).join("");
 var ranking=(currentRole==="admin"?store.staff:store.staff.filter(function(b){return b.id===currentRole})).map(function(b){var bSales=collected.filter(function(s){return s.barberId===b.id});return {b:b,qty:ss.filter(function(s){return s.barberId===b.id}).reduce(function(a,s){return a+s.lines.filter(function(l){return l.type==="servicio"}).reduce(function(t,l){return t+l.qty},0)},0),total:bSales.reduce(function(a,s){return a+total(s)},0)}}).sort(function(a,b){return b.total-a.total});
 $("ranking").innerHTML=ranking.length?'<div class="rank-list">'+ranking.map(function(x){return '<div class="rank-entry"><div class="rank-avatar tone-'+escapeHtml(x.b.tone)+'">'+escapeHtml(x.b.name.slice(0,1).toUpperCase())+'</div><div class="rank-content"><strong>'+escapeHtml(x.b.name)+'</strong><small>'+x.qty+' servicios · '+(x.b.active?"Activo":"Inactivo")+'</small></div><div class="rank-value">'+money(x.total)+'</div></div>'}).join("")+'</div>':'<div class="empty">Sin personal registrado.</div>';
 $("recent").innerHTML=rows(ss.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)}).slice(0,6),false);
}
function statusPill(s){return '<span class="pill '+(s.status==="pendiente"?"pending":"")+'">'+(s.status==="cobrado"?"Cobrado":"Pendiente")+'</span>'}
function rows(sales,withActions){return sales.length?sales.map(function(s){var names=s.lines.map(function(l){return escapeHtml(l.name)+(l.qty>1?" x"+l.qty:"")}).join(", ");var actions=withActions?'<td>'+(s.status==="pendiente"&&currentRole==="admin"?'<button class="outline-btn" data-pay="'+escapeHtml(s.id)+'">Confirmar cobro</button>':'<span style="color:#777">—</span>')+'</td>':"";return '<tr><td><strong>'+(withActions?"#"+escapeHtml(s.id.slice(-7)):"")+'</strong><small>'+dateText(s.date)+'</small></td><td><strong>'+names+'</strong>'+(withActions&&s.client?'<small>Cliente: '+escapeHtml(s.client)+'</small>':"")+'</td><td>'+escapeHtml(s.barberName)+'</td><td class="amount">'+money(total(s))+'</td><td>'+statusPill(s)+'</td>'+actions+'</tr>'}).join(""):'<tr><td colspan="'+(withActions?6:5)+'" class="empty">Aún no hay movimientos para mostrar.</td></tr>'}
function renderStaff(){
 var active=store.staff.filter(function(s){return s.active});$("count-active").textContent=active.length;$("count-inactive").textContent=store.staff.length-active.length;$("avg-commission").textContent=active.length?(active.reduce(function(a,s){return a+s.commission},0)/active.length).toFixed(1)+"%":"—";
 $("staff").innerHTML=store.staff.length?store.staff.map(function(b){var ss=store.sales.filter(function(s){return s.barberId===b.id});return '<article class="staff-card '+(b.active?"":"inactive")+'"><div class="card-top"><div class="staff-avatar tone-'+escapeHtml(b.tone)+'">'+escapeHtml(b.name.slice(0,1).toUpperCase())+'</div><span class="pill '+(b.active?"":"off")+'">'+(b.active?"ACTIVO":"INACTIVO")+'</span></div><h3>'+escapeHtml(b.name)+'</h3><div class="sub">Comisión configurada: '+b.commission+'% por servicio cobrado</div><div class="staff-metrics"><div><strong>'+ss.length+'</strong><small>REGISTROS HISTÓRICOS</small></div><div><strong>'+money(ss.reduce(function(a,s){return a+commission(s)},0))+'</strong><small>COMISIONES ESTIMADAS</small></div></div><div class="card-actions"><button class="outline-btn" data-edit-staff="'+escapeHtml(b.id)+'">Editar</button><button class="'+(b.active?"danger-btn":"outline-btn")+'" data-toggle-staff="'+escapeHtml(b.id)+'">'+(b.active?"Desactivar":"Reactivar")+'</button></div></article>'}).join(""):'<div class="empty">No hay barberos. Añade al primero para comenzar.</div>'
}
function renderCatalog(){
 $("catalog").innerHTML=store.items.map(function(p){return '<tr><td><strong>'+escapeHtml(p.name)+'</strong></td><td>'+(p.type==="servicio"?"Servicio":"Producto")+'</td><td class="amount">'+(p.price===null?"Por definir":money(p.price))+'</td><td><span class="pill '+(p.active?"":"off")+'">'+(p.active?"Activo":"Oculto")+'</span></td><td><div class="action-row"><button data-edit-item="'+escapeHtml(p.id)+'">Editar</button><button data-toggle-item="'+escapeHtml(p.id)+'">'+(p.active?"Ocultar":"Mostrar")+'</button></div></td></tr>'}).join("");
 renderSaleItems();
}
function renderSaleItems(){
 var list=store.items.filter(function(p){return p.active&&(kind==="all"||p.type===kind)});$("sale-items").innerHTML=list.length?list.map(function(p,i){return '<button class="item-tile '+(p.price===null?"unpriced":"")+'" data-add="'+escapeHtml(p.id)+'" '+(p.price===null?"disabled title='Define antes el precio en Catálogo'":"")+ '><span class="tile-icon">'+(p.type==="producto"?"▣":["✂","✦","◆","♛","◇","◈","✺"][i%7])+'</span><strong>'+escapeHtml(p.name)+'</strong><small>'+(p.type==="producto"?"PRODUCTO":"SERVICIO")+'</small><b>'+(p.price===null?"PRECIO PENDIENTE":money(p.price))+'</b></button>'}).join(""):'<div class="empty">No hay conceptos disponibles.</div>';
}
function renderTicket(){
 $("ticket-lines").innerHTML=cart.length?cart.map(function(x){return '<div class="ticket-row"><div class="ticket-description">'+escapeHtml(x.name)+'<small>'+money(x.price)+' × '+x.qty+'</small></div><div class="qty-buttons"><button type="button" data-qty="'+escapeHtml(x.itemId)+'" data-step="-1" aria-label="Reducir">−</button><button type="button" data-qty="'+escapeHtml(x.itemId)+'" data-step="1" aria-label="Aumentar">+</button></div><b>'+money(x.price*x.qty)+'</b></div>'}).join(""):'<div class="empty">Tu ticket está vacío.<br>Selecciona un servicio para comenzar.</div>';
 var sub=cart.reduce(function(a,x){return a+x.qty*x.price},0);var tip=Number($("tip").value);if(!Number.isFinite(tip)||tip<0)tip=0;$("subtotal").textContent=money(sub);$("tip-total").textContent=money(tip);$("total").textContent=money(sub+tip);$("register").disabled=!cart.length||!$("seller").value;
}
function renderSelectors(){
 var sel=$("seller"),old=sel.value;sel.innerHTML='<option value="">Selecciona un barbero</option>'+store.staff.filter(function(s){return s.active}).map(function(b){return '<option value="'+escapeHtml(b.id)+'">'+escapeHtml(b.name)+'</option>'}).join("");sel.value=store.staff.some(function(b){return b.active&&b.id===old})?old:currentRole==="admin"?"":currentRole;
 var f=$("filter-barber"),v=f.value;f.innerHTML='<option value="all">Todos los barberos</option>'+store.staff.map(function(b){return '<option value="'+escapeHtml(b.id)+'">'+escapeHtml(b.name)+'</option>'}).join("");f.value=store.staff.some(function(b){return b.id===v})?v:"all";
}
function filteredHistory(){
 var text=$("filter-text").value.toLowerCase().trim(),b=$("filter-barber").value,status=$("filter-state").value;
 return roleSales().filter(function(s){return (b==="all"||s.barberId===b)&&(status==="all"||s.status===status)&&(!text||(s.client+" "+s.barberName+" "+s.lines.map(function(l){return l.name}).join(" ")).toLowerCase().includes(text))}).sort(function(a,b){return new Date(b.date)-new Date(a.date)});
}
function renderHistory(){$("history").innerHTML=rows(filteredHistory(),true)}
function render(){renderSelectors();renderRoles();renderDashboard();renderStaff();renderCatalog();renderHistory();renderTicket()}
function modalClose(){document.querySelectorAll("dialog[open]").forEach(function(d){d.close()})}
function staffModal(barber){
 $("staff-id").value=barber?barber.id:"";$("staff-name").value=barber?barber.name:"";$("staff-percent").value=barber?barber.commission:40;$("staff-color").value=barber?barber.tone:"gold";$("staff-modal-title").textContent=barber?"Editar barbero":"Añadir barbero";$("staff-modal").showModal();
}
function itemModal(item){
 $("item-id").value=item?item.id:"";$("item-name").value=item?item.name:"";$("item-kind").value=item?item.type:"servicio";$("item-price").value=item&&item.price!==null?item.price:"";$("item-modal-title").textContent=item?"Editar concepto":"Añadir concepto";$("item-modal").showModal();
}
document.addEventListener("click",function(e){
 var b=e.target.closest("[data-page]");if(b){page(b.dataset.page);return}
 b=e.target.closest("[data-goto]");if(b){page(b.dataset.goto);return}
 b=e.target.closest("[data-range]");if(b){range=b.dataset.range;document.querySelectorAll("[data-range]").forEach(function(x){x.classList.toggle("chosen",x===b)});renderDashboard();return}
 b=e.target.closest("[data-kind]");if(b){kind=b.dataset.kind;document.querySelectorAll("[data-kind]").forEach(function(x){x.classList.toggle("chosen",x===b)});renderSaleItems();return}
 b=e.target.closest("[data-add]");if(b){var item=getItem(b.dataset.add);if(!item||item.price===null||!item.active)return;var c=cart.find(function(x){return x.itemId===item.id});if(c)c.qty++;else cart.push({itemId:item.id,name:item.name,type:item.type,price:item.price,qty:1});renderTicket();return}
 b=e.target.closest("[data-qty]");if(b){var entry=cart.find(function(x){return x.itemId===b.dataset.qty});if(entry){entry.qty+=Number(b.dataset.step);if(entry.qty<1)cart=cart.filter(function(x){return x!==entry})}renderTicket();return}
 b=e.target.closest("[data-edit-staff]");if(b){staffModal(getStaff(b.dataset.editStaff));return}
 b=e.target.closest("[data-toggle-staff]");if(b){var who=getStaff(b.dataset.toggleStaff);if(!who)return;if(who.active&&!confirm("¿Desactivar a "+who.name+"? Su historial permanecerá intacto."))return;who.active=!who.active;save();render();toast(who.active?"Barbero reactivado":"Barbero desactivado");return}
 b=e.target.closest("[data-edit-item]");if(b){itemModal(getItem(b.dataset.editItem));return}
 b=e.target.closest("[data-toggle-item]");if(b){var p=getItem(b.dataset.toggleItem);if(!p)return;p.active=!p.active;save();render();toast("Catálogo actualizado");return}
 b=e.target.closest("[data-pay]");if(b){var s=store.sales.find(function(x){return x.id===b.dataset.pay});if(s&&s.status==="pendiente"&&confirm("¿Confirmar que el pago ya fue recibido?")){s.status="cobrado";save();render();toast("Cobro confirmado")}return}
 b=e.target.closest(".close-modal");if(b){modalClose();return}
});
$("new-barber").addEventListener("click",function(){staffModal(null)});
$("new-item").addEventListener("click",function(){itemModal(null)});
$("staff-form").addEventListener("submit",function(e){
 e.preventDefault();if(currentRole!=="admin")return;
 var name=$("staff-name").value.trim(),percent=Number($("staff-percent").value),tone=$("staff-color").value,record=getStaff($("staff-id").value);
 if(!name||!Number.isFinite(percent)||percent<0||percent>100){toast("Revisa el nombre y el porcentaje");return}
 if(record){record.name=name;record.commission=percent;record.tone=tone}else store.staff.push({id:id("b"),name:name,commission:percent,tone:tone,active:true});
 save();modalClose();render();toast(record?"Barbero actualizado":"Barbero añadido");
});
$("item-form").addEventListener("submit",function(e){
 e.preventDefault();if(currentRole!=="admin")return;
 var name=$("item-name").value.trim(),val=$("item-price").value.trim(),price=val===""?null:Number(val),record=getItem($("item-id").value);
 if(!name||(price!==null&&(!Number.isFinite(price)||price<0||price>1000000))){toast("Revisa el nombre y el precio");return}
 if(record){record.name=name;record.type=$("item-kind").value;record.price=price}else store.items.push({id:id("i"),name:name,type:$("item-kind").value,price:price,active:true});
 save();modalClose();render();toast(record?"Concepto actualizado":"Concepto añadido");
});
$("register").addEventListener("click",function(){
 var barber=getStaff($("seller").value);if(!barber||!barber.active||!cart.length){toast("Elige un barbero y al menos un concepto");return}
 var tip=Number($("tip").value);if(!Number.isFinite(tip)||tip<0||tip>100000){toast("Verifica la propina");return}
 var lines=cart.map(function(x){return {itemId:x.itemId,name:x.name,type:x.type,price:x.price,qty:x.qty}});
 store.sales.push({id:id("sale"),date:new Date().toISOString(),barberId:barber.id,barberName:barber.name,commissionRate:barber.commission,lines:lines,client:$("client").value.trim(),note:$("note").value.trim(),method:$("payment").value,status:$("payment-status").value,tip:tip,example:false});
 save();cart=[];$("client").value="";$("note").value="";$("tip").value="0";$("payment-status").value="cobrado";render();toast("Movimiento guardado en este dispositivo");page("inicio");
});
$("clear-ticket").addEventListener("click",function(){cart=[];renderTicket()});
$("tip").addEventListener("input",renderTicket);
$("seller").addEventListener("change",renderTicket);
["filter-barber","filter-state","filter-text"].forEach(function(i){$(i).addEventListener(i==="filter-text"?"input":"change",renderHistory)});
$("role").addEventListener("change",function(){currentRole=this.value;renderRoles();page("inicio");toast(currentRole==="admin"?"Vista de propietario":"Vista simulada de barbero: no es un acceso seguro")});
$("export").addEventListener("click",function(){
 if(currentRole!=="admin")return;
 var fields=["folio","fecha","barbero","cliente","detalle","subtotal","propina","total","forma_pago","estado","comision_estimada"];
 var values=filteredHistory().map(function(s){return [s.id,s.date,s.barberName,s.client,s.lines.map(function(l){return l.name+" x"+l.qty}).join(" + "),subtotal(s),s.tip,total(s),s.method,s.status,commission(s)]});
 function csv(v){var z=String(v===null?"":v);if(/^[=+\-@]/.test(z))z="'"+z;return '"'+z.replace(/"/g,'""')+'"'}
 var content="\uFEFF"+[fields].concat(values).map(function(arr){return arr.map(csv).join(",")}).join("\r\n");
 var blob=new Blob([content],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="LA281_movimientos_"+dateKey(new Date())+".csv";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1000);toast("Reporte CSV descargado");
});
$("menu-btn").addEventListener("click",function(){$("sidebar").classList.toggle("open");$("mobile-overlay").classList.toggle("open")});
$("mobile-overlay").addEventListener("click",function(){$("sidebar").classList.remove("open");this.classList.remove("open")});
$("hide-ribbon").addEventListener("click",function(){document.querySelector(".demo-ribbon").style.display="none"});
document.querySelectorAll("dialog").forEach(function(d){d.addEventListener("click",function(e){if(e.target===d)d.close()})});
$("today").textContent=new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"short",year:"numeric"});
render();page("inicio");
})();