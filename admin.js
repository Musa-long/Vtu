const $=id=>document.getElementById(id);
const ADMIN_KEY='qt_admin_session', KEY_USERS='qt_users', KEY_TX='qt_transactions', KEY_SETTINGS='qt_settings';
const defaultSettings={bank:'Sterling Bank',account:'MFY/DATA 247 COMMUNICATION LTD-wad',number:'8387778364',minimum:1000};
const products=['MTN Airtime','Airtel Airtime','Glo Airtime','9mobile Airtime','MTN Data 1GB','Airtel Data 1GB','Glo Data 1GB','9mobile Data 1GB'];
function users(){return JSON.parse(localStorage.getItem(KEY_USERS)||'[]')}
function txs(){return JSON.parse(localStorage.getItem(KEY_TX)||'[]')}
function settings(){return {...defaultSettings,...JSON.parse(localStorage.getItem(KEY_SETTINGS)||'{}')}}
function saveUsers(v){localStorage.setItem(KEY_USERS,JSON.stringify(v))}
function saveTx(v){localStorage.setItem(KEY_TX,JSON.stringify(v))}
function money(n){return '₦'+Number(n||0).toLocaleString('en-NG')}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function adminLogin(e){e.preventDefault();if($('adminEmail').value==='admin@quicktopup.local'&&$('adminPassword').value==='admin123'){localStorage.setItem(ADMIN_KEY,'1');renderAdmin()}else $('adminLoginMsg').textContent='Invalid admin credentials.'}
function adminLogout(){localStorage.removeItem(ADMIN_KEY);location.reload()}
function saveSettings(){
 const s={bank:$('bank').value.trim(),account:$('acct').value.trim(),number:$('num').value.trim(),minimum:Number($('minimum').value)||1000};
 localStorage.setItem(KEY_SETTINGS,JSON.stringify(s));$('saved').textContent='Settings saved on this browser.';
}
function buildProducts(){
 const box=$('products');const old=JSON.parse(localStorage.getItem('qt_prices')||'{}');
 box.innerHTML=products.map((p,i)=>`<div class="price-row"><b>${p}</b><label>Customer price (₦)<input id="p${i}" type="number" min="0" value="${old[p]??(i<4?1000:500)}"></label></div>`).join('');
 box.insertAdjacentHTML('beforeend','<button onclick="savePrices()">Save Prices</button><p id="priceSaved" class="msg"></p>');
}
function savePrices(){
 const p={};products.forEach((x,i)=>p[x]=Number($('p'+i).value)||0);localStorage.setItem('qt_prices',JSON.stringify(p));$('priceSaved').textContent='Prices saved on this browser.';
}
function approveDeposit(tid){
 const all=txs(),t=all.find(x=>x.id===tid);if(!t||t.status!=='pending')return;
 const us=users(),u=us.find(x=>x.id===t.userId);if(!u)return;
 u.balance+=Number(t.amount);t.status='completed';saveUsers(us);saveTx(all);renderAdmin();
}
function rejectDeposit(tid){const all=txs(),t=all.find(x=>x.id===tid);if(!t||t.status!=='pending')return;t.status='rejected';saveTx(all);renderAdmin()}
function renderAdmin(){
 const logged=localStorage.getItem(ADMIN_KEY)==='1';$('adminLogin').classList.toggle('hidden',logged);$('adminApp').classList.toggle('hidden',!logged);if(!logged)return;
 const s=settings();$('bank').value=s.bank;$('acct').value=s.account;$('num').value=s.number;$('minimum').value=s.minimum;buildProducts();
 const us=users(),all=txs(),pending=all.filter(t=>t.type==='Deposit'&&t.status==='pending');
 $('statCustomers').textContent=us.length;$('statPending').textContent=pending.length;$('statTx').textContent=all.length;
 $('customers').innerHTML=us.length?us.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.phone)}</td><td>${esc(u.email)}</td><td>${money(u.balance)}</td><td><span class="badge ${u.status}">${u.status}</span></td></tr>`).join(''):'<tr><td colspan="5">No customers yet.</td></tr>';
 $('deposits').innerHTML=pending.length?pending.map(t=>{const u=us.find(x=>x.id===t.userId)||{};return `<tr><td>${new Date(t.createdAt).toLocaleString()}</td><td>${esc(u.name||'Unknown')}</td><td>${money(t.amount)}</td><td>${esc(t.description.replace('Wallet funding — ','')).slice(0,40)}</td><td><span class="badge pending">pending</span></td><td><button onclick="approveDeposit('${t.id}')">Approve</button> <button class="danger small" onclick="rejectDeposit('${t.id}')">Reject</button></td></tr>`}).join(''):'<tr><td colspan="6">No pending deposits.</td></tr>';
 $('allTx').innerHTML=all.length?all.slice(0,100).map(t=>{const u=us.find(x=>x.id===t.userId)||{};return `<tr><td>${new Date(t.createdAt).toLocaleString()}</td><td>${esc(u.name||'Unknown')}</td><td>${esc(t.type)}</td><td>${esc(t.description)}</td><td>${money(t.amount)}</td><td><span class="badge ${t.status}">${t.status}</span></td></tr>`}).join(''):'<tr><td colspan="6">No transactions yet.</td></tr>';
}
renderAdmin();