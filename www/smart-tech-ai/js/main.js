$('new').onclick = newChat;
$('menu').onclick = () => { side.classList.add('open'); $('back').classList.add('open'); };
$('back').onclick = closeSide;
document.addEventListener('keydown', e => { if (e.key === 'Escape') { cfgBox.classList.remove('open'); $('lb').classList.remove('open'); closeSide(); } });
if (convs.length) { cur = convs[0]; render(); } else newChat();
setPill();
if (cfg.mode === 'auto' && !ORDER.some(k => on(k)) && navigator.onLine) openCfg();
$('learnnow').onclick = () => learnNow(true);
$('learnclear').onclick = async () => { if (!confirm('Delete everything the app has learned?')) return; kb.clear(); try { await kbTx('readwrite', st => st.clear()); } catch (e) {} localStorage.removeItem('lastLearn'); kbStat(); };
kbLoad().then(() => setTimeout(() => learnDue() && learnNow(), 4000));
setTimeout(() => { if (navigator.onLine && !Object.keys(modelsInst()).length && !localStorage.getItem('tipModels')) { localStorage.setItem('tipModels', '1'); toast('Tip: Settings → Offline models lets you install a free model that works with no internet', 6500); } }, 7000);
setInterval(() => learnDue() && learnNow(), 30 * 60000);
addEventListener('online', () => { setPill(); toast('Back online'); setTimeout(() => learnDue() && learnNow(), 3000); });
addEventListener('offline', () => { setPill(); toast('Offline — using on-device AI'); });
// Service worker: lets the app itself open with no internet (needs https or localhost, plus sw.js beside this file)
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'sw-ready' && localStorage.getItem('swv') !== e.data.version) { localStorage.setItem('swv', e.data.version); toast('App saved — it will now open offline', 3600); }
  });
  navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(r => {
    if (r.active) r.active.postMessage({ type: 'cache-page', url: location.href.split('#')[0] });
  }).catch(() => {});
}
