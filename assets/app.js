const NETFLY_APP_SLUG = 'netfly';
const sb = window.supabase.createClient(window.NETFLY_CONFIG.supabaseUrl, window.NETFLY_CONFIG.supabasePublishableKey);
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function normalizeMovie(m){return {...m,year:m.release_year,duration:m.duration_minutes?`${Math.floor(m.duration_minutes/60)}h ${m.duration_minutes%60}m`:'',poster:m.poster_url,movie:m.movie_url,trailer:m.trailer_url,downloads:Number(m.download_count||0),status:m.status==='PUBLISHED'?'Published':'Draft'}}
async function movies(includeDrafts=false){let query=sb.from('movies').select('*').order('created_at',{ascending:false});if(!includeDrafts)query=query.eq('status','PUBLISHED');const {data,error}=await query;if(error){console.error(error);toast(error.message);return []}return (data||[]).map(normalizeMovie)}
function poster(m){return m.poster?`<img src="${esc(m.poster)}" alt="${esc(m.title)} poster" onerror="this.remove()">`:`<div class="fallback" style="background:linear-gradient(145deg,hsl(${String(m.id).charCodeAt(0)*3} 45% 17%),#8d151b)">${esc(m.title)}</div>`}
function movieCard(m){return `<a class="card" href="movie.html?id=${m.id}"><div class="poster">${poster(m)}<span class="badge">${esc(m.quality)}</span></div><div class="cardbody"><span><strong>${esc(m.title)}</strong><small>${m.year||''} · ${esc(m.genre)}</small></span><span class="stars">★ ${m.rating}</span></div></a>`}
function toast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.append(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}
async function currentUser(){const {data}=await sb.auth.getUser();return data.user}
async function currentProfile(){let u=await currentUser();if(!u)return null;const {data,error}=await sb.rpc('my_app_membership',{requested_app_slug:NETFLY_APP_SLUG});if(error){console.error(error);return null}return data?.[0]||null}
async function requireUser(admin=false){let u=await currentUser();if(!u){location.href=(location.pathname.includes('/admin/')?'../':'')+'login.html';return null}if(admin){let p=await currentProfile();if(p?.role!=='ADMIN'){alert('Administrator access required');location.href='../index.html';return null}}return u}
async function logout(){await sb.auth.signOut();location.href=(location.pathname.includes('/admin/')?'../':'')+'index.html'}
document.addEventListener('DOMContentLoaded',async()=>{
  document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
  const user=await currentUser(),profile=user?await currentProfile():null;
  document.querySelectorAll('[data-user]').forEach(x=>x.textContent=profile?.display_name||user?.email?.split('@')[0]||'Guest');
  const navright=document.querySelector('.topbar .navright');
  if(navright&&user) navright.innerHTML=`<a class="btn" href="account.html">${esc(profile?.display_name||'My account')}</a>${profile?.role==='ADMIN'?'<a class="btn primary" href="admin/index.html">Admin</a>':''}<button class="iconbtn" title="Sign out" onclick="logout()">↗</button><button class="iconbtn mobile" aria-label="Menu">☰</button>`;
  document.querySelectorAll('.mobile').forEach(b=>b.onclick=()=>document.querySelector('.navlinks')?.classList.toggle('open'));
});
