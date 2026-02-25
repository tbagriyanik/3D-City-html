const state = {
  lang: localStorage.getItem('xp-lang') || 'en',
  z: 10,
  windows: new Map(),
  apps: ['notepad', 'calculator', 'explorer', 'browser', 'settings', 'wordpad', 'paint', 'mines']
};

const i18n = {
  en: {
    start: 'Start', notepad: 'Notepad', calculator: 'Calculator', explorer: 'Explorer', browser: 'Browser',
    settings: 'Settings', wordpad: 'WordPad', paint: 'Paint', mines: 'Mines', refresh: 'Refresh',
    newNote: 'New note', clear: 'Clear', calcHint: 'Enter expression', go: 'Go', home: 'Home',
    theme: 'Theme', language: 'Language', draw: 'Draw here', reset: 'Reset', mineInfo: 'Avoid mines!'
  },
  tr: {
    start: 'Başlat', notepad: 'Not Defteri', calculator: 'Hesap Makinesi', explorer: 'Gezgin', browser: 'Tarayıcı',
    settings: 'Ayarlar', wordpad: 'WordPad', paint: 'Paint', mines: 'Mayın', refresh: 'Yenile',
    newNote: 'Yeni not', clear: 'Temizle', calcHint: 'İfade girin', go: 'Git', home: 'Ana sayfa',
    theme: 'Tema', language: 'Dil', draw: 'Burada çiz', reset: 'Sıfırla', mineInfo: 'Mayınlardan kaçın!'
  }
};

const desktop = document.getElementById('desktop');
const taskButtons = document.getElementById('task-buttons');
const startButton = document.getElementById('start-button');
const clock = document.getElementById('clock');
const langToggle = document.getElementById('lang-toggle');
const contextMenu = document.getElementById('context-menu');

function t(key) { return i18n[state.lang][key] || key; }

function makeIcons() {
  const icons = ['📝', '🧮', '📁', '🌐', '⚙️', '📄', '🎨', '💣'];
  state.apps.forEach((app, i) => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.style.left = `${18 + Math.floor(i / 5) * 100}px`;
    el.style.top = `${16 + (i % 5) * 92}px`;
    el.innerHTML = `<div class="icon">${icons[i]}</div><div class="label">${t(app)}</div>`;
    el.ondblclick = () => openWindow(app);
    desktop.appendChild(el);
  });
}

function updateStaticText() {
  startButton.textContent = t('start');
  langToggle.textContent = state.lang.toUpperCase();
  document.querySelectorAll('.desktop-icon .label').forEach((label, i) => label.textContent = t(state.apps[i]));
  state.windows.forEach(({ app, section }) => section.querySelector('.title').textContent = t(app));
}

function windowContent(app) {
  if (app === 'notepad' || app === 'wordpad') {
    const content = localStorage.getItem(`${app}-text`) || '';
    return `<button data-action="newNote">${t('newNote')}</button>
    <textarea data-key="${app}-text" style="width:100%;height:calc(100% - 40px)">${content}</textarea>`;
  }
  if (app === 'calculator') {
    return `<input id="calc-input" placeholder="${t('calcHint')}" style="width:100%"><p id="calc-out">0</p>`;
  }
  if (app === 'explorer') {
    return `<ul><li>Desktop</li><li>Documents</li><li>Pictures</li><li>Music</li></ul>`;
  }
  if (app === 'browser') {
    return `<div style="display:flex;gap:6px"><input id="browser-url" value="https://example.com" style="flex:1"><button id="browser-go">${t('go')}</button></div><iframe id="browser-frame" src="https://example.com" style="width:100%;height:calc(100% - 36px);border:1px solid #aaa"></iframe>`;
  }
  if (app === 'settings') {
    return `<p>${t('theme')}: XP Blue</p><p>${t('language')}: ${state.lang.toUpperCase()}</p><button id="settings-lang">${t('language')}</button>`;
  }
  if (app === 'paint') {
    return `<p>${t('draw')}</p><canvas class="paint-canvas" width="340" height="190"></canvas> <button id="paint-clear">${t('clear')}</button>`;
  }
  if (app === 'mines') {
    return `<p>${t('mineInfo')}</p><div class="mine-grid"></div><button id="mine-reset">${t('reset')}</button>`;
  }
  return '<p>App</p>';
}

function openWindow(app) {
  let win = state.windows.get(app);
  if (win) {
    win.section.hidden = false;
    focusWindow(win.section);
    return;
  }
  const tpl = document.getElementById('window-template').content.firstElementChild.cloneNode(true);
  tpl.dataset.app = app;
  tpl.querySelector('.title').textContent = t(app);
  tpl.querySelector('.window-content').innerHTML = windowContent(app);

  const saved = JSON.parse(localStorage.getItem(`window-${app}`) || '{}');
  tpl.style.width = `${saved.width || 420}px`;
  tpl.style.height = `${saved.height || 280}px`;
  tpl.style.left = `${saved.left || 90 + state.windows.size * 24}px`;
  tpl.style.top = `${saved.top || 50 + state.windows.size * 24}px`;

  attachWindowBehavior(tpl, app);
  desktop.appendChild(tpl);
  addTaskButton(app, tpl);
  focusWindow(tpl);
  state.windows.set(app, { section: tpl, app });
  hookAppBehavior(app, tpl);
}

function addTaskButton(app, section) {
  const btn = document.createElement('button');
  btn.className = 'task-btn';
  btn.textContent = t(app);
  btn.onclick = () => {
    section.hidden = !section.hidden;
    if (!section.hidden) focusWindow(section);
  };
  btn.dataset.app = app;
  taskButtons.appendChild(btn);
}

function persistWindow(el, app) {
  localStorage.setItem(`window-${app}`, JSON.stringify({
    width: parseInt(el.style.width, 10),
    height: parseInt(el.style.height, 10),
    left: parseInt(el.style.left, 10),
    top: parseInt(el.style.top, 10)
  }));
}

function focusWindow(el) {
  state.z += 1;
  el.style.zIndex = state.z;
}

function attachWindowBehavior(el, app) {
  const bar = el.querySelector('.title-bar');
  const handle = el.querySelector('.resize-handle');
  bar.onmousedown = (e) => {
    focusWindow(el);
    const sx = e.clientX, sy = e.clientY;
    const sl = parseInt(el.style.left, 10), st = parseInt(el.style.top, 10);
    const move = (ev) => { el.style.left = `${sl + ev.clientX - sx}px`; el.style.top = `${st + ev.clientY - sy}px`; };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); persistWindow(el, app); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  handle.onmousedown = (e) => {
    e.stopPropagation();
    focusWindow(el);
    const sx = e.clientX, sy = e.clientY;
    const sw = parseInt(el.style.width, 10), sh = parseInt(el.style.height, 10);
    const move = (ev) => {
      el.style.width = `${Math.max(240, sw + ev.clientX - sx)}px`;
      el.style.height = `${Math.max(170, sh + ev.clientY - sy)}px`;
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); persistWindow(el, app); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  el.querySelector('.minimize').onclick = () => { el.hidden = true; persistWindow(el, app); };
  el.querySelector('.close').onclick = () => {
    el.remove();
    document.querySelector(`.task-btn[data-app="${app}"]`)?.remove();
    state.windows.delete(app);
  };

  el.onmousedown = () => focusWindow(el);
  el.oncontextmenu = (e) => showContext(e, app);
}

function showContext(e, app) {
  e.preventDefault();
  contextMenu.innerHTML = '';
  [{ key: app, action: () => openWindow(app) }, { key: 'refresh', action: () => location.reload() }].forEach(item => {
    const li = document.createElement('li');
    li.textContent = t(item.key);
    li.onclick = () => { item.action(); hideContext(); };
    contextMenu.appendChild(li);
  });
  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.hidden = false;
}

function hideContext() { contextMenu.hidden = true; }
window.addEventListener('click', hideContext);
desktop.addEventListener('contextmenu', (e) => {
  if (e.target === desktop) {
    e.preventDefault();
    showContext(e, 'explorer');
  }
});

function hookAppBehavior(app, win) {
  const root = win.querySelector('.window-content');
  if (app === 'notepad' || app === 'wordpad') {
    const ta = root.querySelector('textarea');
    ta.oninput = () => localStorage.setItem(ta.dataset.key, ta.value);
    root.querySelector('button').onclick = () => { ta.value = ''; localStorage.setItem(ta.dataset.key, ''); };
  }

  if (app === 'calculator') {
    const input = root.querySelector('#calc-input');
    const out = root.querySelector('#calc-out');
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        try { out.textContent = String(Function(`return (${input.value})`)()); }
        catch { out.textContent = 'Error'; }
      }
    };
  }

  if (app === 'browser') {
    const url = root.querySelector('#browser-url');
    const frame = root.querySelector('#browser-frame');
    root.querySelector('#browser-go').onclick = () => {
      const target = url.value.startsWith('http') ? url.value : `https://${url.value}`;
      frame.src = target;
    };
  }

  if (app === 'settings') {
    root.querySelector('#settings-lang').onclick = () => {
      state.lang = state.lang === 'en' ? 'tr' : 'en';
      localStorage.setItem('xp-lang', state.lang);
      updateStaticText();
      state.windows.forEach(({ section, app: key }) => {
        section.querySelector('.window-content').innerHTML = windowContent(key);
        hookAppBehavior(key, section);
      });
    };
  }

  if (app === 'paint') {
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    let draw = false;
    canvas.onmousedown = () => { draw = true; };
    canvas.onmouseup = () => { draw = false; ctx.beginPath(); };
    canvas.onmousemove = (e) => {
      if (!draw) return;
      const r = canvas.getBoundingClientRect();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
    };
    root.querySelector('#paint-clear').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (app === 'mines') {
    const grid = root.querySelector('.mine-grid');
    const build = () => {
      grid.innerHTML = '';
      const mines = new Set();
      while (mines.size < 10) mines.add(Math.floor(Math.random() * 64));
      for (let i = 0; i < 64; i++) {
        const b = document.createElement('button');
        b.className = 'mine-cell';
        b.onclick = () => {
          if (mines.has(i)) { b.textContent = '💥'; b.style.background = '#ff8888'; }
          else { b.textContent = '•'; b.style.background = '#c9f7b2'; }
          b.disabled = true;
        };
        grid.appendChild(b);
      }
    };
    build();
    root.querySelector('#mine-reset').onclick = build;
  }
}

function tickClock() {
  clock.textContent = new Date().toLocaleTimeString(state.lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

langToggle.onclick = () => {
  state.lang = state.lang === 'en' ? 'tr' : 'en';
  localStorage.setItem('xp-lang', state.lang);
  updateStaticText();
};

startButton.onclick = () => openWindow('explorer');

makeIcons();
updateStaticText();
setInterval(tickClock, 1000);
tickClock();
