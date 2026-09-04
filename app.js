const $=id=>document.getElementById(id);
const KEY_USERS='qt_users', KEY_SESSION='qt_session', KEY_TX='qt_transactions', KEY_SETTINGS='qt_settings';
const defaultSettings={bank:'Sterling Bank',account:'MFY/DATA 247 COMMUNICATION LTD-wad',number:'8387778364',minimum:1000};
const products=['MTN Airtime','Airtel Airtime','Glo Airtime','9mobile Airtime','MTN Data 1GB','Airtel Data 1GB','Glo Data 1GB','9mobile Data 1GB'];

function getUsers(){return JSON.parse(localStorage.getItem(KEY_USERS)||'[]')}
function saveUsers(v){localStorage.setItem(KEY_USERS,JSON.stringify(v))}
function getTx(){return JSON.parse(localStorage.getItem(KEY_TX)||'[]')}
function saveTx(v){localStorage.setItem(KEY_TX,JSON.stringify(v))}
function getSettings(){return {...defaultSettings,...JSON.parse(localStorage.getItem(KEY_SETTINGS)||'{}')}}
function money(n){return '₦'+Number(n||0).toLocaleString('en-NG')}
function session(){return localStorage.getItem(KEY_SESSION)}
function currentUser(){return getUsers().find(u=>u.id===session())}
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function hash(p){return btoa(unescape(encodeURIComponent(p)))}

function register(e){
 e.preventDefault(); const name=$('regName').value.trim(),phone=$('regPhone').value.trim(),email=$('regEmail').value.trim().toLowerCase(),password=$('regPassword').value;
 let users=getUsers();
 if(users.some(u=>u.email===email)) return $('regMsg').textContent='An account with that email already exists.';
 users.push({id:id(),name,phone,email,password:hash(password),balance:0,status:'active',createdAt:new Date().toISOString()});
 saveUsers(users); $('regMsg').textContent='Account created. You can now log in.'; e.target.reset();
}
function login(e){
 e.preventDefault(); const email=$('loginEmail').value.trim().toLowerCase(),password=hash($('loginPassword').value);
 const u=getUsers().find(x=>x.email===email&&x.password===password&&x.status==='active');
 if(!u) return $('loginMsg').textContent='Invalid email/password or account is inactive.';
 localStorage.setItem(KEY_SESSION,u.id); $('loginMsg').textContent=''; render();
}
function logout(){localStorage.removeItem(KEY_SESSION); render()}
function showOrder(type){$('order').classList.remove('hidden');$('dep').classList.add('hidden');$('title').textContent='Buy '+type;$('order').dataset.type=type;$('order').scrollIntoView({behavior:'smooth'})}
function deposit(){renderSettings();$('dep').classList.remove('hidden');$('order').classList.add('hidden');$('dep').scrollIntoView({behavior:'smooth'})}
function renderSettings(){
 const s=getSettings(); $('min').textContent=money(s.minimum); $('bankName').textContent=s.bank;$('accountName').textContent=s.account;$('accountNumber').textContent=s.number;$('minimumDeposit').textContent=money(s.minimum);
}
function submitOrder(e){
 e.preventDefault(); const u=currentUser(), amount=Number($('amount').value), type=$('order').dataset.type||'Airtime';
 if(!u||amount<=0)return; if(u.balance<amount)return $('orderMsg').textContent='Insufficient wallet balance.';
 u.balance-=amount; const users=getUsers(); users[users.findIndex(x=>x.id===u.id)]=u; saveUsers(users);
 const tx=getTx(); tx.unshift({id:id(),userId:u.id,createdAt:new Date().toISOString(),type:'Purchase',description:`${type} — ${$('network').value} — ${$('orderPhone').value}`,amount:-amount,status:'processing'});saveTx(tx);
 $('orderMsg').textContent='Order submitted successfully.';e.target.reset();render();
}
function submitDeposit(e){
 e.preventDefault();const u=currentUser(),amount=Number($('depositAmount').value),s=getSettings();
 if(amount<s.minimum)return $('depMsg').textContent=`Minimum deposit is ${money(s.minimum)}.`;
 const tx=getTx();tx.unshift({id:id(),userId:u.id,createdAt:new Date().toISOString(),type:'Deposit',description:`Wallet funding — ${$('depositRef').value}`,amount,status:'pending'});saveTx(tx);
 $('depMsg').textContent='Deposit request submitted. Admin approval will credit your wallet.';e.target.reset();renderTransactions();
}
function renderTransactions(){
 const u=currentUser();if(!u)return;const rows=getTx().filter(t=>t.userId===u.id);
 $('transactions').innerHTML=rows.length?rows.map(t=>`<tr><td>${new Date(t.createdAt).toLocaleString()}</td><td>${t.type}</td><td>${t.description}</td><td>${money(t.amount)}</td><td><span class="badge ${t.status}">${t.status}</span></td></tr>`).join(''):'<tr><td colspan="5">No transactions yet.</td></tr>';
 $('txCount').textContent=rows.length;
}
function render(){
 const u=currentUser();$('authPanel').classList.toggle('hidden',!!u);$('appPanel').classList.toggle('hidden',!u);$('logoutBtn').classList.toggle('hidden',!u);
 if(!u){$('welcome').innerHTML='<p>Create an account or log in to use your wallet.</p>';return}
 $('welcome').innerHTML=`<p>Welcome back, <b>${u.name}</b>.</p>`;$('balance').textContent=money(u.balance);$('customerName').textContent=u.name;renderSettings();renderTransactions();
}
render();