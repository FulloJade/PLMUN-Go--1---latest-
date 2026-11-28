/* PLMUN Go service worker: lets the site open with weak or no signal.
   Pages/scripts: network first (so updates show), cache as backup. Images: cache after first view. */
const CACHE = 'plmun-go-v2';
const CORE = ['index.html','about.html','contact.html','student.html','organization.html','admissions.html','programs.html','news.html',
  'campuslife.html','privacy.html','map3d.html','ar.html','style.css','script.js','routes.js','directions.js','enhancements.js','interactive.js',
  'markers.js','aruco.js','manifest.webmanifest','images/plmunlogo.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;   // maps/fonts/etc. go straight to the network
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});