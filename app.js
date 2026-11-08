/* =========================================================
   杭电支线 · HDU SIDE QUESTS
   Vanilla JS — grid motion, detail, ratings, hold-to-delete, upload
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   01. Preset archive
   --------------------------------------------------------- */

const PRESETS = [
  {
    id: 'h01',
    title: '图书馆闭馆前',
    date: '2026.11.02',
    iso: '2026-11-02',
    time: '21:40',
    place: '杭电 · 图书馆四楼',
    stamp: 'HDU · LIBRARY',
    category: '校园',
    image: 'assets/photos/library.jpg',
    feeling: '闭馆音乐响起来之前，整层楼只剩翻书声。有人趴在桌上睡着了，我没叫醒他。那二十分钟，比一整天都安静。',
    baseScore: 4.8,
    baseVotes: 132
  },
  {
    id: 'h02',
    title: '实验室的最后一盏灯',
    date: '2026.11.01',
    iso: '2026-11-01',
    time: '01:20',
    place: '杭电 · 实验室',
    stamp: 'HDU · LAB',
    category: '深夜',
    image: 'assets/photos/lab.jpg',
    feeling: '实验数据跑到第七遍还是不对。窗外天已经蒙蒙亮，楼下保安开始扫地。回宿舍的路上，突然觉得这个结果也没那么重要了。',
    baseScore: 4.4,
    baseVotes: 41
  },
  {
    id: 'h03',
    title: '早八前十分钟',
    date: '2026.10.28',
    iso: '2026-10-28',
    time: '07:52',
    place: '杭电 · 第三教学楼',
    stamp: 'HDU · TEACHING BUILDING',
    category: '校园',
    image: 'assets/photos/campus-hdu.jpg',
    feeling: '早八前十分钟，教学楼还没完全醒。阳光先落在最后一排的桌子上，我在门口站了一会儿，才舍得进去。',
    baseScore: 4.7,
    baseVotes: 96
  },
  {
    id: 'h04',
    title: '食堂的最后一碗面',
    date: '2026.10.16',
    iso: '2026-10-16',
    time: '12:35',
    place: '杭电 · 食堂',
    stamp: 'HDU · CANTEEN',
    category: '校园',
    image: 'assets/photos/canteen.jpg',
    feeling: '下雨天，食堂排队排到门口。拼桌的陌生同学把纸巾推给我，说“你头发滴水了”。那碗面后来忘了味道，只记得这句话。',
    baseScore: 4.5,
    baseVotes: 78
  },
  {
    id: 'h05',
    title: '末班公交没有等我',
    date: '2026.10.11',
    iso: '2026-10-11',
    time: '23:05',
    place: '下沙 · 文海南路',
    stamp: 'XIASHA · WENHAI ROAD',
    category: '下沙',
    image: 'assets/photos/bus.jpg',
    feeling: '末班公交从眼前开走，手机还剩 12% 的电。索性沿着学源街走回去，路灯把影子拉得很长。下沙的夜风比想象中温柔。',
    baseScore: 4.3,
    baseVotes: 28
  },
  {
    id: 'h06',
    title: '球场关灯之前',
    date: '2026.09.24',
    iso: '2026-09-24',
    time: '21:15',
    place: '杭电 · 篮球场',
    stamp: 'HDU · BASKETBALL COURT',
    category: '校园',
    image: 'assets/photos/basketball.jpg',
    feeling: '球场关灯前最后一球，球在篮筐上转了两圈才进。我们喊得整栋楼都听见，第二天早八差点没起来。',
    baseScore: 4.6,
    baseVotes: 64
  },
  {
    id: 'h07',
    title: '第一次和社团出去',
    date: '2026.09.20',
    iso: '2026-09-20',
    time: '17:40',
    place: '杭州 · 九溪',
    stamp: 'HANGZHOU · JIUXI',
    category: '相遇',
    image: 'assets/photos/friends.jpg',
    feeling: '社团招新时随便填的报名表，一个月后把我带到了九溪。大家在山路上互相等，回程时已经约好了下一次。',
    baseScore: 4.9,
    baseVotes: 156
  },
  {
    id: 'h08',
    title: '第四杯咖啡之后',
    date: '2026.09.15',
    iso: '2026-09-15',
    time: '15:36',
    place: '杭电 · 教学区咖啡店',
    stamp: 'HDU · CAFE',
    category: '校园',
    image: 'assets/photos/cafe.jpg',
    feeling: '小组作业改到第四版，咖啡续到第四杯。有人说“算了先吃饭吧”，我们就在咖啡店吃起了外卖。最后拿了几分不记得了，但记得那晚笑得很累。',
    baseScore: 4.5,
    baseVotes: 57
  },
  {
    id: 'h09',
    title: '宿舍熄灯之前',
    date: '2026.09.08',
    iso: '2026-09-08',
    time: '22:10',
    place: '杭电 · 生活区',
    stamp: 'HDU · RESIDENCE',
    category: '校园',
    image: 'assets/photos/dorm.jpg',
    feeling: '回到寝室已经快十一点。室友在赶实验报告，另一个人泡了面。我们聊到熄灯，也没聊出什么结果，但好像明天也没那么难熬了。',
    baseScore: 4.9,
    baseVotes: 143
  },
  {
    id: 'h10',
    title: '骑车去地铁站',
    date: '2026.09.03',
    iso: '2026-09-03',
    time: '18:25',
    place: '下沙 · 学源街',
    stamp: 'XIASHA · XUEYUAN STREET',
    category: '下沙',
    image: 'assets/photos/bike.jpg',
    feeling: '从教学区骑到地铁站，刚好赶上日落。共享单车的篮子嘎吱响，风把耳机线吹得乱七八糟。下沙的傍晚，适合什么都不想。',
    baseScore: 4.6,
    baseVotes: 73
  },
  {
    id: 'h11',
    title: '操场上的音乐会',
    date: '2026.05.22',
    iso: '2026-05-22',
    time: '20:30',
    place: '杭电 · 田径场',
    stamp: 'HDU · TRACK FIELD',
    category: '相遇',
    image: 'assets/photos/concert.jpg',
    feeling: '操场上的音乐会，没有座位，大家坐在草地上。唱到副歌的时候，所有人打开手机闪光灯，像一片很小的星海。',
    baseScore: 4.8,
    baseVotes: 121
  },
  {
    id: 'h12',
    title: '操场的星空',
    date: '2026.04.18',
    iso: '2026-04-18',
    time: '23:30',
    place: '杭电 · 田径场',
    stamp: 'HDU · TRACK FIELD',
    category: '深夜',
    image: 'assets/photos/stars.jpg',
    feeling: '夜跑结束，躺在操场草地上不想动。抬头发现能看到几颗星星，城市里原来也有。旁边有人在打电话，声音很轻。',
    baseScore: 5.0,
    baseVotes: 204
  },
  {
    id: 'h13',
    title: '在图书馆躲雨',
    date: '2026.04.02',
    iso: '2026-04-02',
    time: '16:05',
    place: '杭电 · 图书馆',
    stamp: 'HDU · LIBRARY',
    category: '校园',
    image: 'assets/photos/books.jpg',
    feeling: '在图书馆躲雨，随手抽出一本旧书。扉页上有人写“2019 级，祝你顺利”。我把书放回原位，像替一个陌生人保守秘密。',
    baseScore: 4.6,
    baseVotes: 69
  },
  {
    id: 'h14',
    title: '周末去爬北高峰',
    date: '2026.03.30',
    iso: '2026-03-30',
    time: '10:40',
    place: '杭州 · 北高峰',
    stamp: 'HANGZHOU · BEIGAOFENG',
    category: '杭州',
    image: 'assets/photos/hike.jpg',
    feeling: '周末去爬北高峰，本来只想散心。爬到一半开始后悔，登顶之后又觉得值得。下山时买了一瓶冰水，喝出了庆功酒的感觉。',
    baseScore: 4.7,
    baseVotes: 94
  },
  {
    id: 'h15',
    title: '教学区的樱花开了',
    date: '2026.03.24',
    iso: '2026-03-24',
    time: '16:20',
    place: '杭电 · 教学区',
    stamp: 'HDU · CAMPUS',
    category: '校园',
    image: 'assets/photos/sakura.jpg',
    feeling: '教学区的樱花开了，朋友圈刷屏。我绕远路去拍了一张，结果最满意的是树下那辆旧自行车。春天好像每年都这样，短暂但准时。',
    baseScore: 4.8,
    baseVotes: 118
  },
  {
    id: 'h16',
    title: '返校的最后一班车',
    date: '2026.02.23',
    iso: '2026-02-23',
    time: '19:10',
    place: '杭州东站 · 站台',
    stamp: 'HANGZHOU EAST · PLATFORM',
    category: '下沙',
    image: 'assets/photos/train-station.jpg',
    feeling: '寒假结束，坐最后一班高铁回杭州。行李箱很重，站台上全是返校的学生。到站那一刻，突然觉得下沙的风也很亲切。',
    baseScore: 4.7,
    baseVotes: 88
  }
];

const RATING_LABELS = ['路过', '有点意思', '值得绕路', '想收藏', '杭电名场面'];
const CATEGORY_NOTES = {
  校园: '课表之外的那几步，才是大学生活真正的注脚。',
  下沙: '下沙的风很大，但总有一段路值得多走。',
  杭州: '杭州不只有西湖，还有学生周末偷偷跑出去的那半天。',
  相遇: '在杭电，人与人之间最短的路，往往是一次没有目的的相遇。',
  深夜: '深夜把杭电调成静音，才听得见自己。'
};
const CATEGORIES = ['校园', '下沙', '杭州', '相遇', '深夜'];
const LS_KEYS = {
  ratings: 'hdu-sidequests.ratings.v1',
  hidden: 'hdu-sidequests.hidden.v1',
  fallbackUploads: 'hdu-sidequests.uploads.fallback.v1',
  apiBase: 'hdu-sidequests.api-base.v1',
  authToken: 'hdu-sidequests.auth-token.v1'
};
const DB_NAME = 'hdu-sidequests-archive';
const DB_STORE = 'photos';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const HOLD_MS = 2000;

/* ---------------------------------------------------------
   02. State + helpers
   --------------------------------------------------------- */

const state = {
  uploads: [],
  hidden: new Set(readJSON(LS_KEYS.hidden, [])),
  ratings: readJSON(LS_KEYS.ratings, {}),
  serverQuests: [],
  serverMode: false,
  apiBase: resolveApiBase(),
  apiPendingRatings: new Set(),
  authAvailable: false,
  user: null,
  authIntent: '',
  authBusy: false,
  adminTab: 'users',
  adminUsers: [],
  adminQuests: [],
  adminTotalUsers: 0,
  adminTotalQuests: 0,
  adminQuestFilter: 'pending',
  adminPreviewQuest: null,
  adminPreviewIndex: 0,
  albumIndex: 0,
  albumQuestId: null,
  detailFlipped: false,
  filter: 'all',
  activeId: null,
  db: null,
  pendingImage: '',
  pendingFile: null,
  pendingImages: [],
  pendingMotion: null,
  peekValue: 0,
  peekIndex: null,
  peekPressing: false,
  lastFocus: null,
  lastDeleted: null,
  flight: null,
  flightPending: false,
  toastTimer: 0,
  statsAnimated: false
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Local storage is unavailable:', error);
  }
}

function readAuthToken() {
  try {
    return localStorage.getItem(LS_KEYS.authToken) || '';
  } catch (error) {
    return '';
  }
}

function storeAuthToken(token) {
  try {
    localStorage.setItem(LS_KEYS.authToken, token);
  } catch (error) {
    console.warn('Could not persist auth token:', error);
  }
}

function clearAuthToken() {
  try {
    localStorage.removeItem(LS_KEYS.authToken);
  } catch (error) {
    /* ignore */
  }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeText(value) {
  return String(value ?? '');
}

function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function currentTime() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function isoToDisplay(iso) {
  return (iso || todayISO()).replaceAll('-', '.');
}

function pad(number) {
  return String(number).padStart(2, '0');
}

function resolveApiBase() {
  try {
    const override = new URLSearchParams(window.location.search).get('api')
      || window.HDU_API_BASE_URL
      || localStorage.getItem(LS_KEYS.apiBase);
    if (override) return override.replace(/\/+$/, '');
  } catch (error) {
    /* ignore malformed URL state */
  }
  if (['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
    return 'http://127.0.0.1:8000/api';
  }
  return '';
}

function avatarHue(username) {
  let hash = 0;
  for (const character of String(username || '杭电')) {
    hash = (hash * 31 + character.codePointAt(0)) % 360;
  }
  return hash;
}

function avatarInitial(username) {
  const first = Array.from(String(username || '杭电').trim())[0] || '杭';
  return first.toUpperCase();
}

function profileUrl(username) {
  return `profile.html?u=${encodeURIComponent(username)}`;
}

function apiHeaders(extra = {}) {
  const headers = { ...extra };
  const token = readAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function apiRequest(path, options = {}) {
  if (!state.apiBase) throw new Error('API 未配置');
  const { timeoutMs = 9000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${state.apiBase}${path}`, {
      ...fetchOptions,
      headers: apiHeaders(fetchOptions.headers || {}),
      signal: controller.signal
    });
    if (response.status === 401 && readAuthToken() && !path.startsWith('/auth/')) {
      clearAuthToken();
      state.user = null;
      updateAuthUI();
    }
    if (!response.ok) {
      let detail = `请求失败（${response.status}）`;
      try {
        const payload = await response.json();
        if (payload?.detail) detail = payload.detail;
      } catch (error) {
        /* ignore non-JSON error bodies */
      }
      throw new Error(detail);
    }
    return response;
  } finally {
    window.clearTimeout(timer);
  }
}

async function connectApi() {
  if (!state.apiBase) return false;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 1400);
  try {
    const response = await fetch(`${state.apiBase}/health`, { signal: controller.signal });
    return response.ok;
  } catch (error) {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

async function connectApiWithRetry() {
  if (await connectApi()) return true;
  await new Promise(resolve => window.setTimeout(resolve, 900));
  return connectApi();
}

async function restoreSession() {
  if (!readAuthToken()) {
    state.user = null;
    updateAuthUI();
    return;
  }
  try {
    const response = await apiRequest('/auth/me');
    state.user = await response.json();
  } catch (error) {
    clearAuthToken();
    state.user = null;
  }
  updateAuthUI();
}

function updateAuthUI() {
  if (!dom.authButton) return;
  dom.authButton.hidden = !state.authAvailable;
  if (!state.authAvailable) {
    closeAuthMenu();
    return;
  }

  const user = state.user;
  dom.authButton.classList.toggle('is-user', Boolean(user));
  dom.authAvatar.textContent = user ? (user.username || '?').slice(0, 1) : '登';
  dom.authLabel.textContent = user ? user.username : '登录 / 注册';
  dom.authMenuName.textContent = user ? user.username : '';
  dom.authMenuRole.textContent = user
    ? (user.role === 'admin' ? 'ADMIN / 管理员' : 'USER / 普通用户')
    : '';
  dom.myProfileButton.hidden = !user;
  dom.adminPanelButton.hidden = !user || user.role !== 'admin';

  if (!user) closeAuthMenu();
}

function closeAuthMenu() {
  if (!dom.authMenu) return;
  dom.authMenu.hidden = true;
  dom.authButton.setAttribute('aria-expanded', 'false');
}

function toggleAuthMenu() {
  if (!state.user) {
    openAuth();
    return;
  }
  const willOpen = dom.authMenu.hidden;
  dom.authMenu.hidden = !willOpen;
  dom.authButton.setAttribute('aria-expanded', String(willOpen));
}

function openAuth(intent = '') {
  if (!state.authAvailable) {
    showToast('登录服务还没有连接，请先启动 FastAPI');
    return;
  }
  closeAuthMenu();
  state.authIntent = intent;
  setAuthMode('login');
  dom.authForm.reset();
  dom.authError.hidden = true;
  authOpen = true;
  state.lastFocus = document.activeElement;
  dom.authLayer.classList.add('is-open');
  dom.authLayer.setAttribute('aria-hidden', 'false');
  dom.body.classList.add('is-locked');
  window.setTimeout(() => dom.authIdentifier.focus({ preventScroll: true }), 180);
}

function closeAuth(skipFocus = false) {
  if (!authOpen) return;
  authOpen = false;
  state.authIntent = '';
  dom.authLayer.classList.remove('is-open');
  dom.authLayer.setAttribute('aria-hidden', 'true');
  if (!uploadOpen && !detailOpen && !adminOpen) dom.body.classList.remove('is-locked');
  if (!skipFocus && state.lastFocus && document.contains(state.lastFocus)) {
    state.lastFocus.focus({ preventScroll: true });
  }
}

function setAuthMode(mode) {
  const registering = mode === 'register';
  dom.authTabs.forEach(tab => {
    const active = tab.dataset.authMode === mode;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  dom.authTitle.textContent = registering ? '加入杭电支线' : '登录杭电支线';
  dom.authIdentifierLabel.textContent = registering ? '用户名' : '用户名 / 邮箱';
  dom.authIdentifier.placeholder = registering ? '2–32 位，支持中文' : '输入用户名或邮箱';
  dom.authIdentifier.autocomplete = 'username';
  dom.authEmailField.hidden = !registering;
  dom.authEmail.required = registering;
  dom.authPassword.autocomplete = registering ? 'new-password' : 'current-password';
  dom.authPassword.placeholder = registering ? '至少 8 位' : '输入密码';
  dom.authSubmitLabel.textContent = registering ? '创建账号' : '登录';
  dom.authError.hidden = true;
}

async function submitAuth(event) {
  event.preventDefault();
  if (state.authBusy) return;

  const mode = dom.authTabRegister.classList.contains('is-active') ? 'register' : 'login';
  const identifier = dom.authIdentifier.value.trim();
  const email = dom.authEmail.value.trim();
  const password = dom.authPassword.value;
  const fail = message => {
    dom.authError.textContent = message;
    dom.authError.hidden = false;
  };

  if (mode === 'register') {
    if (identifier.length < 2) return fail('用户名至少需要 2 个字符');
    if (!email.includes('@')) return fail('请填写有效邮箱');
    if (password.length < 8) return fail('密码至少需要 8 位');
  } else {
    if (!identifier) return fail('请输入用户名或邮箱');
    if (!password) return fail('请输入密码');
  }

  state.authBusy = true;
  dom.authSubmit.disabled = true;
  dom.authSubmitLabel.textContent = mode === 'register' ? '正在创建…' : '正在登录…';
  dom.authError.hidden = true;

  try {
    const response = await apiRequest(mode === 'register' ? '/auth/register' : '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode === 'register'
        ? { username: identifier, email, password }
        : { identifier, password })
    });
    const payload = await response.json();
    storeAuthToken(payload.access_token);
    state.user = payload.user;
    state.authAvailable = true;
    updateAuthUI();

    const intent = state.authIntent;
    try {
      await loadServerQuests();
      renderArchive();
      if (detailOpen && state.activeId) {
        const active = findQuest(state.activeId);
        if (active) renderDetail(active);
      }
    } catch (refreshError) {
      console.warn('Logged in, but archive refresh failed:', refreshError);
    }
    closeAuth(true);
    showToast(mode === 'register' ? '账号已创建，欢迎加入杭电支线' : `欢迎回来，${payload.user.username}`);
    if (intent === 'upload') window.setTimeout(openUpload, 200);
    if (intent === 'admin') window.setTimeout(openAdmin, 200);
  } catch (error) {
    fail(error.message || '登录失败，请稍后再试');
  } finally {
    state.authBusy = false;
    dom.authSubmit.disabled = false;
    dom.authSubmitLabel.textContent = mode === 'register' ? '创建账号' : '登录';
  }
}

async function logout() {
  clearAuthToken();
  state.user = null;
  updateAuthUI();
  closeAuthMenu();
  try {
    await loadServerQuests();
  } catch (error) {
    console.warn('Could not refresh after logout:', error);
  }
  if (detailOpen) closeDetail(true);
  renderArchive();
  showToast('已退出登录');
}

function setupAuth() {
  if (!dom.authButton) return;
  dom.authButton.addEventListener('click', event => {
    event.stopPropagation();
    if (state.user) toggleAuthMenu();
    else openAuth();
  });
  dom.authTabs.forEach(tab => tab.addEventListener('click', () => setAuthMode(tab.dataset.authMode)));
  dom.authClose.addEventListener('click', () => closeAuth());
  $$('[data-close-auth]').forEach(element => element.addEventListener('click', () => closeAuth()));
  dom.authForm.addEventListener('submit', submitAuth);
  dom.logoutButton.addEventListener('click', logout);
  dom.myProfileButton.addEventListener('click', () => {
    if (!state.user) return;
    window.location.href = profileUrl(state.user.username);
  });
  dom.adminPanelButton.addEventListener('click', () => {
    closeAuthMenu();
    openAdmin();
  });
  document.addEventListener('click', event => {
    if (dom.authMenu.hidden) return;
    if (!dom.authSlot.contains(event.target)) closeAuthMenu();
  });
}

async function openAdmin() {
  if (!state.user || state.user.role !== 'admin') {
    showToast('需要管理员权限');
    return;
  }
  if (detailOpen) closeDetail(true);
  if (uploadOpen) closeUpload(true);
  closeAuthMenu();
  adminOpen = true;
  state.lastFocus = document.activeElement;
  state.adminTab = 'users';
  state.adminQuestFilter = 'pending';
  updateAdminTabs();
  dom.adminBody.innerHTML = '<div class="admin-loading">正在读取用户与投稿…</div>';
  dom.adminLayer.classList.add('is-open');
  dom.adminLayer.setAttribute('aria-hidden', 'false');
  dom.body.classList.add('is-locked');
  await loadAdminData();
  window.setTimeout(() => dom.adminClose.focus({ preventScroll: true }), 180);
}

function closeAdmin(skipFocus = false) {
  if (!adminOpen) return;
  closeAdminPreview();
  adminOpen = false;
  dom.adminLayer.classList.remove('is-open');
  dom.adminLayer.setAttribute('aria-hidden', 'true');
  if (!uploadOpen && !detailOpen && !authOpen) dom.body.classList.remove('is-locked');
  if (!skipFocus && state.lastFocus && document.contains(state.lastFocus)) {
    state.lastFocus.focus({ preventScroll: true });
  }
}

function updateAdminTabs() {
  dom.adminTabs.forEach(tab => {
    const active = tab.dataset.adminTab === state.adminTab;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

async function loadAdminData() {
  try {
    const [usersResponse, questsResponse] = await Promise.all([
      apiRequest('/admin/users?limit=200'),
      apiRequest(`/admin/quests?limit=200${state.adminQuestFilter === 'all' ? '' : `&status=${encodeURIComponent(state.adminQuestFilter)}`}`)
    ]);
    const users = await usersResponse.json();
    const quests = await questsResponse.json();
    state.adminUsers = users.items;
    state.adminTotalUsers = users.total;
    state.adminQuests = quests.items;
    state.adminTotalQuests = quests.total;
    renderAdmin();
  } catch (error) {
    dom.adminBody.innerHTML = `<p class="admin-error">${escapeHTML(error.message || '读取管理数据失败')}</p>`;
  }
}

function renderAdmin() {
  if (state.adminTab === 'users') {
    const rows = state.adminUsers.map(user => {
      const isSelf = state.user && user.id === state.user.id;
      const roleBadge = user.role === 'admin'
        ? '<span class="admin-badge admin-badge--admin">ADMIN</span>'
        : '<span class="admin-badge">USER</span>';
      const activeBadge = user.is_active
        ? ''
        : '<span class="admin-badge admin-badge--off">已停用</span>';
      const actions = isSelf
        ? '<span class="admin-badge">当前账号</span>'
        : `<button class="admin-action" type="button" data-admin-action="role" data-user-id="${escapeHTML(user.id)}" data-role="${user.role === 'admin' ? 'user' : 'admin'}">${user.role === 'admin' ? '降为用户' : '设为管理员'}</button>
           <button class="admin-action ${user.is_active ? 'admin-action--danger' : ''}" type="button" data-admin-action="active" data-user-id="${escapeHTML(user.id)}" data-active="${user.is_active ? 'false' : 'true'}">${user.is_active ? '停用' : '启用'}</button>`;
      return `<div class="admin-row">
        <div class="admin-row__main">
          <div class="admin-row__title">${escapeHTML(user.username)} ${roleBadge} ${activeBadge}</div>
          <div class="admin-row__sub">${escapeHTML(user.email)} · 注册于 ${escapeHTML(new Date(user.created_at).toLocaleDateString('zh-CN'))}</div>
        </div>
        <div class="admin-actions">${actions}</div>
      </div>`;
    }).join('');

    dom.adminBody.innerHTML = `
      <div class="admin-section-head">
        <h3>用户与角色</h3>
        <span>${state.adminTotalUsers} 个账号</span>
      </div>
      <div class="admin-list">${rows || '<div class="admin-empty">还没有用户</div>'}</div>`;
    return;
  }

  const rows = state.adminQuests.map(quest => {
    const statusBadge = quest.status === 'approved'
      ? '<span class="admin-badge">已公开</span>'
      : quest.status === 'rejected'
        ? '<span class="admin-badge admin-badge--off">未通过</span>'
        : '<span class="admin-badge admin-badge--pending">待审核</span>';
    const owner = quest.owner_username ? `@${quest.owner_username}` : '预设内容';
    const reason = quest.review_reason
      ? `<div class="admin-reason">拒绝原因：${escapeHTML(quest.review_reason)}</div>`
      : '';
    return `<div class="admin-row">
      <a class="admin-thumb" href="${escapeHTML(quest.image)}" data-admin-preview="${escapeHTML(quest.id)}" aria-label="查看投稿原图">
        <img src="${escapeHTML(quest.image)}" alt="" loading="lazy">
      </a>
      <div class="admin-row__main">
        <div class="admin-row__title">${escapeHTML(quest.title)} ${statusBadge}</div>
        <div class="admin-row__sub">${escapeHTML(owner)} · ${escapeHTML(quest.category)} · ${escapeHTML(quest.date)} · ${quest.votes} 人评分${quest.image_count > 1 ? ` · 图集 ${quest.image_count}` : ''}${quest.has_motion ? ` · <a class="admin-motion-link" href="${escapeHTML(quest.motion)}" target="_blank" rel="noopener">实况视频</a>` : ''}</div>
        <div class="admin-row__excerpt">${escapeHTML((quest.feeling || '').slice(0, 90))}</div>
        ${reason}
      </div>
      <div class="admin-actions">
        <button class="admin-action" type="button" data-admin-preview="${escapeHTML(quest.id)}">查看</button>
        <button class="admin-action" type="button" data-admin-action="status" data-quest-id="${escapeHTML(quest.id)}" data-status="${quest.status === 'approved' ? 'pending' : 'approved'}">${quest.status === 'approved' ? '转为待审' : '通过公开'}</button>
        ${quest.status === 'rejected' ? '' : `<button class="admin-action admin-action--danger" type="button" data-admin-action="reject" data-quest-id="${escapeHTML(quest.id)}">拒绝</button>`}
        ${quest.is_user ? `<button class="admin-action admin-action--danger" type="button" data-admin-action="delete" data-quest-id="${escapeHTML(quest.id)}">删除</button>` : ''}
      </div>
    </div>`;
  }).join('');

  const filters = [
    ['pending', '待审核'],
    ['approved', '已公开'],
    ['rejected', '未通过'],
    ['all', '全部']
  ].map(([value, label]) => `<button class="admin-filter ${state.adminQuestFilter === value ? 'is-active' : ''}" type="button" data-admin-filter="${value}">${label}</button>`).join('');

  dom.adminBody.innerHTML = `
    <div class="admin-section-head">
      <h3>投稿与审核</h3>
      <span>${state.adminTotalQuests} 条内容</span>
    </div>
    <div class="admin-filters">${filters}</div>
    <div class="admin-list">${rows || '<div class="admin-empty">这个筛选下还没有投稿</div>'}</div>`;
}

async function handleAdminAction(event) {
  const button = event.target.closest('[data-admin-action]');
  if (!button) return;
  const action = button.dataset.adminAction;
  button.disabled = true;

  try {
    if (action === 'role') {
      await apiRequest(`/admin/users/${encodeURIComponent(button.dataset.userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: button.dataset.role })
      });
      showToast('用户角色已更新');
    } else if (action === 'active') {
      await apiRequest(`/admin/users/${encodeURIComponent(button.dataset.userId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: button.dataset.active === 'true' })
      });
      showToast(button.dataset.active === 'true' ? '用户已启用' : '用户已停用');
    } else if (action === 'status') {
      await apiRequest(`/admin/quests/${encodeURIComponent(button.dataset.questId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: button.dataset.status })
      });
      showToast(button.dataset.status === 'approved' ? '投稿已公开' : '投稿已转为待审');
    } else if (action === 'reject') {
      const reason = window.prompt('填写拒绝原因（会展示给投稿者）：', '内容需要调整后再发布');
      if (reason === null) return;
      const trimmed = reason.trim();
      if (!trimmed) {
        showToast('请填写拒绝原因');
        return;
      }
      await apiRequest(`/admin/quests/${encodeURIComponent(button.dataset.questId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason: trimmed })
      });
      showToast('投稿已拒绝，原因会展示给作者');
    } else if (action === 'delete') {
      if (!window.confirm('确定永久删除这条投稿吗？')) return;
      await apiRequest(`/quests/${encodeURIComponent(button.dataset.questId)}`, { method: 'DELETE' });
      showToast('投稿已删除');
    }

    await Promise.all([loadAdminData(), loadServerQuests()]);
    renderArchive();
  } catch (error) {
    console.error('Admin action failed:', error);
    showToast(error.message || '管理操作失败');
  } finally {
    button.disabled = false;
  }
}

function openAdminPreview(questId) {
  const quest = state.adminQuests.find(item => item.id === questId);
  if (!quest) return;
  state.adminPreviewQuest = quest;
  state.adminPreviewIndex = 0;
  dom.adminPreviewTitle.textContent = quest.title;
  dom.adminPreviewMeta.textContent = `${quest.owner_username ? `@${quest.owner_username}` : '预设内容'} · ${quest.category} · ${quest.date} · ${quest.status === 'pending' ? '待审核' : quest.status === 'rejected' ? '未通过' : '已公开'} · ${quest.votes} 人评分`;
  dom.adminPreviewFeeling.textContent = quest.feeling || '没有填写感受。';
  dom.adminPreviewReason.textContent = quest.review_reason ? `拒绝原因：${quest.review_reason}` : '';
  dom.adminPreviewReason.hidden = !quest.review_reason;
  dom.adminPreviewMotion.hidden = !quest.motion;
  if (quest.motion) dom.adminPreviewMotion.href = quest.motion;
  renderAdminPreviewImage(0);
  dom.adminPreview.hidden = false;
  dom.adminPreviewClose.focus({ preventScroll: true });
}

function renderAdminPreviewImage(index) {
  const quest = state.adminPreviewQuest;
  if (!quest) return;
  const images = Array.isArray(quest.images) && quest.images.length ? quest.images : [quest.image];
  state.adminPreviewIndex = clamp(index, 0, images.length - 1);
  dom.adminPreviewImage.src = images[state.adminPreviewIndex];
  dom.adminPreviewImage.alt = quest.title;
  dom.adminPreviewThumbs.innerHTML = images.map((url, imageIndex) => `
    <button type="button" class="admin-preview__thumb ${imageIndex === state.adminPreviewIndex ? 'is-active' : ''}" data-preview-index="${imageIndex}" aria-label="查看第 ${imageIndex + 1} 张图">
      <img src="${escapeHTML(url)}" alt="" loading="lazy">
    </button>`).join('');
  dom.adminPreviewThumbs.hidden = images.length < 2;
}

function closeAdminPreview() {
  dom.adminPreview.hidden = true;
  state.adminPreviewQuest = null;
}

function setupAdmin() {
  if (!dom.adminLayer) return;
  dom.adminClose.addEventListener('click', () => closeAdmin());
  $$('[data-close-admin]').forEach(element => element.addEventListener('click', () => closeAdmin()));
  dom.adminTabs.forEach(tab => tab.addEventListener('click', () => {
    state.adminTab = tab.dataset.adminTab;
    updateAdminTabs();
    renderAdmin();
  }));
  dom.adminBody.addEventListener('click', event => {
    const preview = event.target.closest('[data-admin-preview]');
    if (preview) {
      event.preventDefault();
      openAdminPreview(preview.dataset.adminPreview);
      return;
    }
    const filter = event.target.closest('[data-admin-filter]');
    if (filter) {
      state.adminQuestFilter = filter.dataset.adminFilter;
      loadAdminData();
      return;
    }
    handleAdminAction(event);
  });

  dom.adminPreviewClose.addEventListener('click', closeAdminPreview);
  $$('[data-close-admin-preview]').forEach(element => element.addEventListener('click', closeAdminPreview));
  dom.adminPreviewThumbs.addEventListener('click', event => {
    const button = event.target.closest('[data-preview-index]');
    if (button) renderAdminPreviewImage(Number(button.dataset.previewIndex) || 0);
  });
}

function mapServerQuest(item) {
  return {
    ...item,
    fromApi: true,
    isUser: Boolean(item.is_user),
    baseScore: 0,
    baseVotes: 0,
    createdAt: Date.parse(item.created_at) || 0
  };
}

async function loadServerQuests() {
  const response = await apiRequest('/quests?limit=100');
  const payload = await response.json();
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    console.warn('FastAPI 已连接，但数据库为空。请先运行 python -m app.seed。');
    state.serverMode = false;
    state.serverQuests = [];
    return false;
  }
  state.serverQuests = payload.items.map(mapServerQuest);
  state.serverMode = true;
  document.body.dataset.dataMode = 'server';
  return true;
}

function allQuests() {
  if (state.serverMode) return state.serverQuests;
  return [...state.uploads, ...PRESETS];
}

function visibleQuests() {
  return allQuests().filter(quest => !state.hidden.has(quest.id));
}

function normalQuests() {
  return visibleQuests().filter(quest => !quest.fromApi || quest.status === 'approved');
}

function expandQuestImages(posts = normalQuests()) {
  return posts.flatMap(quest => {
    const images = questImages(quest);
    return images.map((image, index) => ({
      ...quest,
      image,
      albumIndex: index,
      image_count: images.length,
      is_album: images.length > 1,
      displayKey: `${quest.id}::${index}`
    }));
  });
}

function indexQuests() {
  return expandQuestImages(normalQuests());
}

function featuredQuests(limit = 10) {
  const candidates = expandQuestImages(normalQuests());
  return [...candidates]
    .sort((left, right) => {
      const a = getRating(left);
      const b = getRating(right);
      if (b.avg !== a.avg) return b.avg - a.avg;
      return b.votes - a.votes;
    })
    .slice(0, limit);
}

function findQuest(id) {
  return allQuests().find(quest => quest.id === id) || null;
}

function getRating(quest) {
  if (quest.fromApi) {
    const votes = Number(quest.votes) || 0;
    const mine = Number(quest.my_rating) || 0;
    const avg = Number(quest.score) || 0;
    return {
      mine,
      votes,
      sum: avg * votes,
      avg
    };
  }
  const baseVotes = Number(quest.baseVotes) || 0;
  const baseSum = (Number(quest.baseScore) || 0) * baseVotes;
  const mine = Number(state.ratings[quest.id]) || 0;
  const votes = baseVotes + (mine ? 1 : 0);
  const sum = baseSum + mine;
  return {
    mine,
    votes,
    sum,
    avg: votes ? sum / votes : 0
  };
}

function displayScore(quest) {
  const rating = getRating(quest);
  return rating.votes ? rating.avg.toFixed(1) : 'NEW';
}

function saveRatings() {
  writeJSON(LS_KEYS.ratings, state.ratings);
}

function saveHidden() {
  writeJSON(LS_KEYS.hidden, Array.from(state.hidden));
}

/* ---------------------------------------------------------
   03. DOM references
   --------------------------------------------------------- */

const dom = {
  body: document.body,
  header: $('#siteHeader'),
  menuButton: $('#menuButton'),
  mobileMenu: $('#mobileMenu'),
  gridMotion: $('#gridMotion'),
  gmPlane: $('#gmPlane'),
  hero: $('#hero'),
  heroSpot: $('#heroSpot'),
  heroCount: $('#heroCount'),
  gallery: $('#gallery'),
  galleryEmpty: $('#galleryEmpty'),
  filters: $('#filters'),
  indexCount: $('#indexCount'),
  statQuests: $('#statQuests'),
  statRating: $('#statRating'),
  stats: $('#stats'),
  scrollProgress: $('#scrollProgress'),
  sling: $('#sling'),
  slingPad: $('#slingPad'),
  slingBandA: $('#slingBandA'),
  slingBandB: $('#slingBandB'),
  slingArc: $('#slingArc'),
  detailLayer: $('#detailLayer'),
  detailClose: $('#detailClose'),
  detailVisual: $('.detail-visual'),
  flipStage: $('.flip-stage'),
  detailIndex: $('#detailIndex'),
  detailCategory: $('#detailCategory'),
  detailImage: $('#detailImage'),
  detailVideo: $('#detailVideo'),
  motionToggle: $('#motionToggle'),
  motionToggleLabel: $('#motionToggleLabel'),
  ownerAvatar: $('#ownerAvatar'),
  ownerAvatarText: $('#ownerAvatarText'),
  ratingCard: $('#ratingCard'),
  flipCard: $('#flipCard'),
  flipInner: $('#flipInner'),
  flipBack: $('#flipBack'),
  flipBackContent: $('#flipBackContent'),
  flipBackMeta: $('#flipBackMeta'),
  flipBackTitle: $('#flipBackTitle'),
  flipBackFeeling: $('#flipBackFeeling'),
  flipBackNote: $('#flipBackNote'),
  flipToggle: $('#flipToggle'),
  albumStack: $('#albumStack'),
  albumControls: $('#albumControls'),
  albumCounter: $('#albumCounter'),
  albumPrev: $('#albumPrev'),
  albumNext: $('#albumNext'),
  detailReview: $('#detailReview'),
  reflectiveCard: $('#reflectiveCard'),
  detailStampDate: $('#detailStampDate'),
  detailStampPlace: $('#detailStampPlace'),
  detailDate: $('#detailDate'),
  detailTime: $('#detailTime'),
  detailTimeDot: $('#detailTimeDot'),
  detailPlace: $('#detailPlace'),
  detailNote: $('#detailNote'),
  detailMine: $('#detailMine'),
  detailTitle: $('#detailTitle'),
  detailFeeling: $('#detailFeeling'),
  detailContent: $('#detailContent'),
  detailScroll: $('.detail-scroll'),
  ratingAverage: $('#ratingAverage'),
  ratingCount: $('#ratingCount'),
  ratingBars: $('#ratingBars'),
  peekRating: $('#peekRating'),
  ratingNote: $('#ratingNote'),
  shareButton: $('#shareButton'),
  holdDelete: $('#holdDelete'),
  holdDeleteText: $('#holdDeleteText'),
  holdHint: $('#holdHint'),
  detailPrev: $('#detailPrev'),
  detailNext: $('#detailNext'),
  detailPrevTitle: $('#detailPrevTitle'),
  detailNextTitle: $('#detailNextTitle'),
  uploadLayer: $('#uploadLayer'),
  uploadClose: $('#uploadClose'),
  uploadNo: $('#uploadNo'),
  uploadForm: $('#uploadForm'),
  fileInput: $('#fileInput'),
  uploadMotionChip: $('#uploadMotionChip'),
  uploadMotionName: $('#uploadMotionName'),
  dropzone: $('#dropzone'),
  dropEmpty: $('#dropEmpty'),
  dropPreview: $('#dropPreview'),
  albumPreview: $('#albumPreview'),
  uploadAlbumStack: $('#uploadAlbumStack'),
  uploadAlbumCount: $('#uploadAlbumCount'),
  albumClear: $('#albumClear'),
  previewImg: $('#previewImg'),
  fileName: $('#fileName'),
  fileMeta: $('#fileMeta'),
  replaceFile: $('#replaceFile'),
  fieldTitle: $('#fieldTitle'),
  fieldDate: $('#fieldDate'),
  fieldTime: $('#fieldTime'),
  fieldCategory: $('#fieldCategory'),
  dateYear: $('#dateYear'),
  dateMonth: $('#dateMonth'),
  dateDay: $('#dateDay'),
  categoryGlide: $('#categoryGlide'),
  fieldPlace: $('#fieldPlace'),
  fieldFeeling: $('#fieldFeeling'),
  feelingCount: $('#feelingCount'),
  publishButton: $('#publishButton'),
  resetRatings: $('#resetRatings'),
  restoreHidden: $('#restoreHidden'),
  hiddenCount: $('#hiddenCount'),
  toast: $('#toast'),
  toastText: $('#toastText'),
  toastAction: $('#toastAction'),
  cardTemplate: $('#cardTemplate'),
  sparkCanvas: $('#sparkCanvas'),
  intro: $('#intro'),
  authSlot: $('#authSlot'),
  authButton: $('#authButton'),
  authAvatar: $('#authAvatar'),
  authLabel: $('#authLabel'),
  authMenu: $('#authMenu'),
  authMenuName: $('#authMenuName'),
  authMenuRole: $('#authMenuRole'),
  myProfileButton: $('#myProfileButton'),
  adminPanelButton: $('#adminPanelButton'),
  logoutButton: $('#logoutButton'),
  authLayer: $('#authLayer'),
  authClose: $('#authClose'),
  authForm: $('#authForm'),
  authTabs: $$('.auth-tab'),
  authTabRegister: $('#authTabRegister'),
  authTitle: $('#authTitle'),
  authIdentifierField: $('#authIdentifierField'),
  authIdentifierLabel: $('#authIdentifierLabel'),
  authIdentifier: $('#authIdentifier'),
  authEmailField: $('#authEmailField'),
  authEmail: $('#authEmail'),
  authPassword: $('#authPassword'),
  authError: $('#authError'),
  authSubmit: $('#authSubmit'),
  authSubmitLabel: $('#authSubmitLabel'),
  adminLayer: $('#adminLayer'),
  adminClose: $('#adminClose'),
  adminBody: $('#adminBody'),
  adminTabs: $$('.admin-tab'),
  adminPreview: $('#adminPreview'),
  adminPreviewClose: $('#adminPreviewClose'),
  adminPreviewTitle: $('#adminPreviewTitle'),
  adminPreviewImage: $('#adminPreviewImage'),
  adminPreviewThumbs: $('#adminPreviewThumbs'),
  adminPreviewMeta: $('#adminPreviewMeta'),
  adminPreviewFeeling: $('#adminPreviewFeeling'),
  adminPreviewReason: $('#adminPreviewReason'),
  adminPreviewMotion: $('#adminPreviewMotion')
};

/* ---------------------------------------------------------
   04. Database (IndexedDB with localStorage fallback)
   --------------------------------------------------------- */

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    const timer = window.setTimeout(() => reject(new Error('Opening the archive timed out')), 1200);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      window.clearTimeout(timer);
      resolve(request.result);
    };
    request.onerror = () => {
      window.clearTimeout(timer);
      reject(request.error || new Error('Could not open the archive'));
    };
    request.onblocked = () => {
      window.clearTimeout(timer);
      reject(new Error('The archive database is blocked'));
    };
  });
}

function dbGetAll() {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(DB_STORE, 'readonly');
    const request = transaction.objectStore(DB_STORE).getAll();
    const timer = window.setTimeout(() => reject(new Error('Reading the archive timed out')), 1500);
    request.onsuccess = () => {
      window.clearTimeout(timer);
      resolve(request.result || []);
    };
    request.onerror = () => {
      window.clearTimeout(timer);
      reject(request.error);
    };
  });
}

function dbPut(record) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(DB_STORE, 'readwrite');
    const timer = window.setTimeout(() => reject(new Error('Saving the photo timed out')), 2600);
    transaction.objectStore(DB_STORE).put(record);
    transaction.oncomplete = () => {
      window.clearTimeout(timer);
      resolve(record);
    };
    transaction.onerror = () => {
      window.clearTimeout(timer);
      reject(transaction.error);
    };
    transaction.onabort = () => {
      window.clearTimeout(timer);
      reject(transaction.error);
    };
  });
}

function dbDelete(id) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(DB_STORE, 'readwrite');
    const timer = window.setTimeout(() => reject(new Error('Removing the photo timed out')), 2000);
    transaction.objectStore(DB_STORE).delete(id);
    transaction.oncomplete = () => {
      window.clearTimeout(timer);
      resolve();
    };
    transaction.onerror = () => {
      window.clearTimeout(timer);
      reject(transaction.error);
    };
    transaction.onabort = () => {
      window.clearTimeout(timer);
      reject(transaction.error);
    };
  });
}

async function loadUploads() {
  let records = [];

  try {
    state.db = await openDatabase();
    records = await dbGetAll();
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to localStorage:', error);
    state.db = null;
    records = readJSON(LS_KEYS.fallbackUploads, []);
  }

  const merged = new Map();
  [...records, ...state.uploads].forEach(record => {
    if (!record || !record.id || !record.image) return;
    merged.set(record.id, record);
  });

  state.uploads = Array.from(merged.values())
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function persistUpload(record) {
  if (state.db) {
    return dbPut(record);
  }

  const next = [record, ...state.uploads.filter(item => item.id !== record.id)];
  writeJSON(LS_KEYS.fallbackUploads, next);
  return record;
}

async function removePersistedUpload(id) {
  if (state.db) {
    return dbDelete(id);
  }
  const next = state.uploads.filter(item => item.id !== id);
  writeJSON(LS_KEYS.fallbackUploads, next);
}

/* ---------------------------------------------------------
   05. Intro, header, menu
   --------------------------------------------------------- */

function finishIntro() {
  requestAnimationFrame(() => {
    dom.body.classList.add('is-ready');
  });
  window.setTimeout(() => {
    if (dom.intro) dom.intro.style.display = 'none';
  }, 1500);
}

function setupHeader() {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset;
      dom.header.classList.toggle('is-scrolled', y > 45);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      dom.scrollProgress.style.width = `${max > 0 ? clamp((y / max) * 100, 0, 100) : 0}%`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupMenu() {
  const close = () => {
    dom.menuButton.setAttribute('aria-expanded', 'false');
    dom.mobileMenu.classList.remove('is-open');
    dom.mobileMenu.setAttribute('aria-hidden', 'true');
  };

  dom.menuButton.addEventListener('click', () => {
    const open = dom.menuButton.getAttribute('aria-expanded') !== 'true';
    dom.menuButton.setAttribute('aria-expanded', String(open));
    dom.mobileMenu.classList.toggle('is-open', open);
    dom.mobileMenu.setAttribute('aria-hidden', String(!open));
  });

  $$('a, button', dom.mobileMenu).forEach(element => {
    element.addEventListener('click', close);
  });

  document.addEventListener('click', event => {
    if (!dom.mobileMenu.classList.contains('is-open')) return;
    if (dom.mobileMenu.contains(event.target) || dom.menuButton.contains(event.target)) return;
    close();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) close();
  });
}

/* ---------------------------------------------------------
   06. Grid Motion background
   --------------------------------------------------------- */

function tileMarkup(quest) {
  return `
    <span class="gm-tile__shade"></span>
    <span class="gm-tile__caption">
      <span>
        <strong></strong>
        <span></span>
      </span>
      <i aria-hidden="true">↗</i>
    </span>
  `;
}

function buildGrid() {
  const list = featuredQuests(10);
  const plane = dom.gmPlane;
  plane.innerHTML = '';

  if (!list.length) {
    dom.gridMotion.classList.add('is-empty');
    return;
  }

  dom.gridMotion.classList.remove('is-empty');

  const rowCount = 4;
  const groupSize = window.innerWidth < 700 ? 6 : 8;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = document.createElement('div');
    row.className = 'gm-row';

    const track = document.createElement('div');
    track.className = 'gm-track';
    track.style.setProperty('--gm-duration', `${78 + rowIndex * 13}s`);

    for (let copy = 0; copy < 2; copy += 1) {
      const group = document.createElement('div');
      group.className = 'gm-group';

      for (let tileIndex = 0; tileIndex < groupSize; tileIndex += 1) {
        const quest = list[(rowIndex * 5 + tileIndex * 3 + copy * 0) % list.length];
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'gm-tile';
        tile.dataset.questId = quest.id;
        tile.dataset.albumIndex = String(quest.albumIndex || 0);
        tile.tabIndex = -1;
        tile.setAttribute('aria-hidden', 'true');
        tile.innerHTML = tileMarkup(quest);

        const image = document.createElement('img');
        image.src = quest.image;
        image.alt = '';
        image.loading = 'eager';
        image.decoding = 'async';
        image.draggable = false;
        tile.prepend(image);

        $('.gm-tile__caption strong', tile).textContent = quest.title;
        $('.gm-tile__caption span span', tile).textContent = `${quest.date} / ${quest.place}`;

        image.addEventListener('error', () => {
          tile.style.background = 'linear-gradient(140deg, #242018, #0d0b09)';
          image.style.display = 'none';
        });

        group.append(tile);
      }

      track.append(group);
    }

    row.append(track);
    plane.append(row);
  }
}

function setupGridMotion() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let spotRaf = 0;
  let lastSpotTime = 0;
  let lastX = 0;
  let lastY = 0;

  const resetSpot = () => {
    $$('.gm-tile', dom.gmPlane).forEach(tile => tile.style.setProperty('--spot', '0'));
    dom.heroSpot.style.opacity = '0';
    dom.gmPlane.style.setProperty('--gm-x', '0px');
    dom.gmPlane.style.setProperty('--gm-y', '0px');
  };

  const paintSpot = () => {
    spotRaf = 0;
    if (reduceMotion.matches) return;

    const tiles = $$('.gm-tile', dom.gmPlane);
    tiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      if (rect.right < -80 || rect.left > window.innerWidth + 80 || rect.bottom < -80 || rect.top > window.innerHeight + 80) {
        tile.style.setProperty('--spot', '0');
        return;
      }
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(lastX - centerX, lastY - centerY);
      const reach = Math.max(320, Math.min(560, window.innerWidth * 0.34));
      const spot = clamp(1 - distance / reach, 0, 1);
      tile.style.setProperty('--spot', spot.toFixed(3));
    });
  };

  const updateSpot = (x, y, touch) => {
    lastX = x;
    lastY = y;

    dom.heroSpot.style.setProperty('--mx', `${x}px`);
    dom.heroSpot.style.setProperty('--my', `${y}px`);
    dom.heroSpot.style.opacity = '1';

    const nx = x / window.innerWidth - 0.5;
    const ny = y / window.innerHeight - 0.5;
    const strength = touch ? 0.55 : 1;
    dom.gmPlane.style.setProperty('--gm-x', `${nx * 22 * strength}px`);
    dom.gmPlane.style.setProperty('--gm-y', `${ny * 16 * strength}px`);

    const now = performance.now();
    if (!spotRaf && now - lastSpotTime > 70) {
      lastSpotTime = now;
      spotRaf = requestAnimationFrame(paintSpot);
    }
  };

  dom.hero.addEventListener('pointermove', event => {
    if (reduceMotion.matches) return;
    updateSpot(event.clientX, event.clientY, event.pointerType === 'touch');
  }, { passive: true });

  dom.hero.addEventListener('touchstart', event => {
    const point = event.touches[0];
    if (!point || reduceMotion.matches) return;
    updateSpot(point.clientX, point.clientY, true);
  }, { passive: true });

  dom.hero.addEventListener('touchmove', event => {
    const point = event.touches[0];
    if (!point || reduceMotion.matches) return;
    updateSpot(point.clientX, point.clientY, true);
  }, { passive: true });

  dom.hero.addEventListener('touchend', resetSpot, { passive: true });
  dom.hero.addEventListener('touchcancel', resetSpot, { passive: true });
  dom.hero.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') resetSpot();
  });
  dom.hero.addEventListener('pointercancel', event => {
    if (event.pointerType !== 'touch') resetSpot();
  });
  dom.hero.addEventListener('pointerup', event => {
    if (event.pointerType === 'touch') resetSpot();
  });

  dom.gmPlane.addEventListener('click', event => {
    const tile = event.target.closest('.gm-tile');
    if (!tile) return;
    openDetail(tile.dataset.questId, $('img', tile), Number(tile.dataset.albumIndex) || 0);
  });

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', resetSpot);
  }
}

/* ---------------------------------------------------------
   07. Cards, filters, reveal
   --------------------------------------------------------- */

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
  : null;

function observeReveal(element) {
  if (!revealObserver) {
    element.classList.add('in-view');
    return;
  }
  revealObserver.observe(element);
}

function cardClassFor(index) {
  if (index % 9 === 0) return 'is-portrait';
  if (index % 9 === 3) return 'is-wide';
  if (index % 9 === 6) return 'is-square';
  return '';
}

function updateFilterCounts() {
  const list = indexQuests();
  const allButton = $('[data-filter="all"]', dom.filters);
  if (allButton) $('span', allButton).textContent = String(list.length);

  CATEGORIES.forEach(category => {
    const button = $(`[data-filter="${category}"]`, dom.filters);
    if (!button) return;
    $('span', button).textContent = String(list.filter(quest => quest.category === category).length);
  });

  dom.heroCount.textContent = String(list.length);
  dom.indexCount.textContent = `（${list.length}）`;
}

function renderGallery() {
  const list = indexQuests();
  const fragment = document.createDocumentFragment();
  dom.gallery.innerHTML = '';

  list.forEach((quest, index) => {
    const card = dom.cardTemplate.content.firstElementChild.cloneNode(true);
    const rating = getRating(quest);
    const cardClass = cardClassFor(index);

    if (cardClass) card.classList.add(cardClass);
    card.dataset.id = quest.displayKey || quest.id;
    card.dataset.questId = quest.id;
    card.dataset.imageIndex = String(quest.albumIndex || 0);
    card.dataset.category = quest.category;
    card.style.setProperty('--delay', `${Math.min(index * 40, 320)}ms`);

    const image = $('img', card);
    image.src = quest.image;
    image.alt = `${quest.title}，${quest.place}`;
    image.addEventListener('error', () => {
      image.style.display = 'none';
      $('.quest-card__media', card).style.background = 'linear-gradient(145deg, #2a241b, #100e0b)';
    });

    $('.quest-card__cat', card).textContent = quest.category;
    $('.quest-card__no', card).textContent = `${pad(index + 1)} / ${pad(list.length)}`;
    $('.quest-card__title-row h3', card).textContent = quest.title;
    $('.quest-card__date', card).textContent = quest.date;
    $('.quest-card__place', card).textContent = quest.place;
    $('.quest-card__score-num', card).textContent = rating.votes ? rating.avg.toFixed(1) : 'NEW';
    $('.quest-card__score .star', card).textContent = rating.votes ? '★' : '✳';

    const reviewBadge = $('.quest-card__review', card);
    const reviewStatus = quest.fromApi ? quest.status : 'approved';
    if (reviewStatus && reviewStatus !== 'approved') {
      reviewBadge.hidden = false;
      reviewBadge.textContent = reviewStatus === 'pending' ? '待审核' : '未通过';
      reviewBadge.classList.add(`is-${reviewStatus}`);
    } else {
      reviewBadge.hidden = true;
    }

    const albumBadge = $('.quest-card__album', card);
    if (quest.image_count > 1) {
      albumBadge.hidden = false;
      albumBadge.textContent = `图集 ${quest.albumIndex + 1}/${quest.image_count}`;
    } else {
      albumBadge.hidden = true;
    }

    if (quest.isUser && (!quest.fromApi || quest.is_owner)) {
      const mine = $('.quest-card__mine', card);
      mine.hidden = false;
    }

    const button = $('.quest-card__button', card);
    button.setAttribute('aria-label', `打开支线：${quest.title}，${quest.place}，${quest.date}`);
    button.addEventListener('click', () => openDetail(quest.id, image, quest.albumIndex));
    attachCardTilt(button);

    fragment.append(card);
  });

  dom.gallery.append(fragment);
  $$('.quest-card', dom.gallery).forEach(card => observeReveal(card));
  applyFilter(false);
  updateFilterCounts();
}

function attachCardTilt(button) {
  const media = $('.quest-card__media', button);
  const glare = $('.quest-card__glare', button);
  let frame = 0;
  let pointer = { x: 0, y: 0 };
  let touching = false;

  const paint = () => {
    frame = 0;
    const rect = media.getBoundingClientRect();
    const px = clamp((pointer.x - rect.left) / rect.width, 0, 1);
    const py = clamp((pointer.y - rect.top) / rect.height, 0, 1);
    const rx = (0.5 - py) * 7;
    const ry = (px - 0.5) * 8;
    media.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    media.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    glare.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    glare.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
  };

  const updateTilt = (x, y) => {
    pointer = { x, y };
    if (!frame) frame = requestAnimationFrame(paint);
  };

  button.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touching = true;
  }, { passive: true });

  button.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && !touching) return;
    updateTilt(event.clientX, event.clientY);
  }, { passive: true });

  button.addEventListener('touchstart', event => {
    const point = event.touches[0];
    if (!point) return;
    touching = true;
    updateTilt(point.clientX, point.clientY);
  }, { passive: true });

  button.addEventListener('touchmove', event => {
    const point = event.touches[0];
    if (!point) return;
    updateTilt(point.clientX, point.clientY);
  }, { passive: true });

  const reset = () => {
    touching = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    media.style.setProperty('--rx', '0deg');
    media.style.setProperty('--ry', '0deg');
  };

  button.addEventListener('touchend', reset, { passive: true });
  button.addEventListener('touchcancel', reset, { passive: true });
  button.addEventListener('pointerup', reset);
  button.addEventListener('pointercancel', event => {
    if (event.pointerType !== 'touch') reset();
  });
  button.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') reset();
  });
  button.addEventListener('blur', reset);
}

function applyFilter(animate = true) {
  const cards = $$('.quest-card', dom.gallery);
  let visibleCount = 0;

  cards.forEach(card => {
    const matches = state.filter === 'all' || card.dataset.category === state.filter;
    card.classList.toggle('is-filtered', !matches);
    if (matches) {
      visibleCount += 1;
      if (animate) {
        card.animate(
          [
            { opacity: 0, transform: 'translateY(14px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'none' }
        );
      }
    }
  });

  dom.galleryEmpty.hidden = visibleCount !== 0;
}

function setupFilters() {
  dom.filters.addEventListener('click', event => {
    const button = event.target.closest('.filter');
    if (!button) return;
    const next = button.dataset.filter;
    if (next === state.filter) return;
    state.filter = next;
    $$('.filter', dom.filters).forEach(item => item.classList.toggle('is-active', item === button));
    applyFilter(true);
  });
}

/* ---------------------------------------------------------
   08. Stats / scores
   --------------------------------------------------------- */

function aggregateAverage() {
  const list = normalQuests();
  let votes = 0;
  let sum = 0;
  list.forEach(quest => {
    const rating = getRating(quest);
    votes += rating.votes;
    sum += rating.sum;
  });
  return votes ? sum / votes : 0;
}

function updateStats() {
  const list = normalQuests();
  const average = aggregateAverage();

  dom.statQuests.dataset.count = String(list.length);
  dom.statRating.dataset.count = average.toFixed(1);

  if (state.statsAnimated) {
    dom.statQuests.textContent = String(list.length);
    dom.statRating.textContent = average.toFixed(1);
  }

  dom.restoreHidden.hidden = state.hidden.size === 0;
  dom.hiddenCount.textContent = String(state.hidden.size);
}

function animateStats() {
  if (state.statsAnimated) return;
  state.statsAnimated = true;

  $$('.count-up', dom.stats).forEach(element => {
    const target = Number(element.dataset.count) || 0;
    const decimals = Number(element.dataset.decimals) || 0;
    const start = performance.now();
    const duration = 1300;

    const tick = now => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

function setupStats() {
  if (!('IntersectionObserver' in window)) {
    animateStats();
    return;
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      animateStats();
      observer.disconnect();
    }
  }, { threshold: 0.45 });
  observer.observe(dom.stats);
}

/* ---------------------------------------------------------
   09. Detail view
   --------------------------------------------------------- */

let detailOpen = false;
let uploadOpen = false;
let authOpen = false;
let adminOpen = false;

function starsMarkup(value) {
  const rounded = Math.round(value);
  return Array.from({ length: 5 }, (_, index) => {
    const className = index < rounded ? '' : ' class="off"';
    return `<span${className}>★</span>`;
  }).join('');
}

function starSvg() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.21l-5.64 2.97 1.08-6.29L2.87 9.44l6.31-.92L12 2.8z" fill="currentColor"/></svg>';
}

function renderRatingCard(quest) {
  const rating = getRating(quest);
  dom.ratingAverage.textContent = rating.votes ? rating.avg.toFixed(1) : '—';
  dom.ratingCount.textContent = rating.votes.toLocaleString('zh-CN');
  dom.ratingBars.innerHTML = starsMarkup(rating.avg);

  if (rating.mine) {
    dom.ratingNote.innerHTML = `你给了 <strong>${rating.mine}</strong> 分 · ${RATING_LABELS[rating.mine - 1]}，谢谢你把这一刻看完。`;
  } else {
    dom.ratingNote.textContent = '点击星星即可评分，再点一次可以收回。';
  }

  buildPeekRating(quest, rating.mine);
}

function buildPeekRating(quest, value) {
  state.peekValue = value;
  state.peekIndex = null;
  state.peekPressing = false;

  const row = document.createElement('div');
  row.className = 'peek-rating__row';

  const tip = document.createElement('span');
  tip.className = 'peek-rating__tip';
  tip.setAttribute('aria-hidden', 'true');
  tip.dataset.show = 'false';
  row.append(tip);

  for (let index = 0; index < 5; index += 1) {
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'peek-rating__star';
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-checked', String(value === index + 1));
    star.setAttribute('aria-label', `${index + 1} 分，${RATING_LABELS[index]}`);
    star.tabIndex = value === 0 ? (index === 0 ? 0 : -1) : (value === index + 1 ? 0 : -1);

    const lift = document.createElement('span');
    lift.className = 'peek-rating__lift';
    const glyph = document.createElement('span');
    glyph.className = 'peek-rating__glyph';
    glyph.dataset.lit = String(index < value);
    glyph.innerHTML = starSvg();

    lift.append(glyph);
    star.append(lift);
    star.dataset.index = String(index);
    row.append(star);
  }

  dom.peekRating.innerHTML = '';
  dom.peekRating.append(row);

  const stars = $$('.peek-rating__star', row);
  const glyphs = $$('.peek-rating__glyph', row);
  const lifts = $$('.peek-rating__lift', row);
  let lastPointerCommit = 0;

  const indexAt = event => {
    const rect = row.getBoundingClientRect();
    const index = clamp(Math.floor(((event.clientX - rect.left) / rect.width) * 5), 0, 4);
    return index;
  };

  const paint = (hoverIndex, preview = true) => {
    state.peekIndex = hoverIndex;
    const shown = preview && hoverIndex !== null ? hoverIndex + 1 : state.peekValue;

    glyphs.forEach((glyph, index) => {
      glyph.dataset.lit = String(index < shown);
    });

    lifts.forEach((lift, index) => {
      if (preview && hoverIndex !== null && index <= hoverIndex) {
        lift.style.transform = `translateY(-7px) scale(${index === hoverIndex ? 1.18 : 1})`;
      } else {
        lift.style.transform = 'translateY(0) scale(1)';
      }
    });

    if (preview && hoverIndex !== null) {
      const rect = row.getBoundingClientRect();
      const slot = rect.width / 5;
      const center = slot * (hoverIndex + 0.5);
      tip.textContent = RATING_LABELS[hoverIndex];
      tip.style.setProperty('--tip-x', `${center - tip.offsetWidth / 2}px`);
      tip.dataset.show = 'true';
    } else {
      tip.dataset.show = 'false';
    }
  };

  row.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' && !state.peekPressing) return;
    paint(indexAt(event), true);
  });

  row.addEventListener('pointerleave', () => {
    if (state.peekPressing) return;
    paint(null, false);
  });

  row.addEventListener('pointerdown', event => {
    if (event.button !== 0 || state.peekPressing) return;
    state.peekPressing = true;
    row.setPointerCapture?.(event.pointerId);
    paint(indexAt(event), true);
  });

  row.addEventListener('pointerup', event => {
    if (!state.peekPressing) return;
    state.peekPressing = false;
    const index = indexAt(event);
    lastPointerCommit = performance.now();
    commitRating(quest, index + 1);
    if (event.pointerType !== 'mouse') paint(null, false);
  });

  row.addEventListener('pointercancel', () => {
    state.peekPressing = false;
    paint(null, false);
  });

  stars.forEach((star, index) => {
    star.addEventListener('click', event => {
      if (event.detail === 0 || performance.now() - lastPointerCommit > 350) {
        commitRating(quest, index + 1, { restoreFocus: event.detail === 0 });
      }
    });

    star.addEventListener('focus', () => {
      if (state.peekPressing) return;
      paint(index, true);
    });

    star.addEventListener('blur', () => {
      if (state.peekPressing) return;
      paint(null, false);
    });
  });

  row.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'].includes(event.key)) return;
    event.preventDefault();
    let next = state.peekValue;
    if (event.key === 'ArrowRight') next = clamp(state.peekValue + 1, 0, 5);
    if (event.key === 'ArrowLeft') next = clamp(state.peekValue - 1, 0, 5);
    if (event.key === 'Home') next = 1;
    if (event.key === 'End') next = 5;
    if (event.key === 'Backspace' || event.key === 'Delete') next = 0;
    commitRating(quest, next, { restoreFocus: true });
  });

  paint(null, false);
}

function commitRating(quest, value, options = {}) {
  if (quest.fromApi) {
    if (quest.status && quest.status !== 'approved') {
      showToast(quest.status === 'pending' ? '审核通过后才可以评分' : '未通过审核的投稿不能评分');
      return;
    }
    if (!state.user) {
      openAuth('rating');
      return;
    }
    commitServerRating(quest, value, options);
    return;
  }

  const previous = Number(state.ratings[quest.id]) || 0;
  const next = previous === value ? 0 : value;

  if (next) {
    state.ratings[quest.id] = next;
  } else {
    delete state.ratings[quest.id];
  }
  saveRatings();

  state.peekValue = next;
  state.peekIndex = null;

  renderRatingCard(quest);
  updateGalleryScore(quest.id);
  updateStats();

  const star = $$('.peek-rating__glyph', dom.peekRating)[Math.max(0, next - 1)];
  if (star && next && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    star.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.28)', offset: 0.42 },
        { transform: 'scale(1)' }
      ],
      { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }

  if (next) {
    pulseNote(next);
  }

  if (options.restoreFocus) {
    requestAnimationFrame(() => {
      const focusIndex = next ? Math.max(0, next - 1) : 0;
      $$('.peek-rating__star', dom.peekRating)[focusIndex]?.focus({ preventScroll: true });
    });
  }
}

async function commitServerRating(quest, value, options = {}) {
  if (state.apiPendingRatings.has(quest.id)) return;

  const previous = Number(quest.my_rating) || 0;
  const next = previous === value ? 0 : value;
  state.apiPendingRatings.add(quest.id);

  try {
    const path = `/quests/${encodeURIComponent(quest.id)}/rating`;
    const response = await apiRequest(path, next
      ? {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: next })
        }
      : { method: 'DELETE' });

    const payload = await response.json();
    quest.score = payload.average;
    quest.votes = payload.votes;
    quest.my_rating = payload.my_rating;
    state.peekValue = payload.my_rating;
    state.peekIndex = null;

    renderRatingCard(quest);
    updateGalleryScore(quest.id);
    updateStats();

    const star = $$('.peek-rating__glyph', dom.peekRating)[Math.max(0, payload.my_rating - 1)];
    if (star && payload.my_rating && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      star.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.28)', offset: 0.42 },
          { transform: 'scale(1)' }
        ],
        { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
    }

    if (payload.my_rating) {
      pulseNote(payload.my_rating);
    }

    if (options.restoreFocus) {
      requestAnimationFrame(() => {
        const focusIndex = payload.my_rating ? Math.max(0, payload.my_rating - 1) : 0;
        $$('.peek-rating__star', dom.peekRating)[focusIndex]?.focus({ preventScroll: true });
      });
    }
  } catch (error) {
    console.error('Rating request failed:', error);
    showToast(error.message || '评分没有提交成功，请稍后再试');
  } finally {
    state.apiPendingRatings.delete(quest.id);
  }
}

function pulseNote(value) {
  dom.ratingNote.innerHTML = `你给了 <strong>${value}</strong> 分 · ${RATING_LABELS[value - 1]}，谢谢你把这一刻看完。`;
  dom.ratingNote.animate(
    [
      { opacity: 0, transform: 'translateY(3px)' },
      { opacity: 1, transform: 'none' }
    ],
    { duration: 320, easing: 'ease-out' }
  );
}

function updateGalleryScore(id) {
  const quest = findQuest(id);
  if (!quest) return;
  const rating = getRating(quest);
  const cards = $$(`.quest-card[data-quest-id="${CSS.escape(id)}"]`, dom.gallery);
  cards.forEach(card => {
    $('.quest-card__score-num', card).textContent = rating.votes ? rating.avg.toFixed(1) : 'NEW';
    $('.quest-card__score .star', card).textContent = rating.votes ? '★' : '✳';
  });
}

function renderDetail(quest) {
  const archive = allQuests();
  const visible = visibleQuests();
  const index = archive.findIndex(item => item.id === quest.id);
  const visibleIndex = visible.findIndex(item => item.id === quest.id);
  const previous = visible.length > 1 ? visible[(visibleIndex - 1 + visible.length) % visible.length] : null;
  const next = visible.length > 1 ? visible[(visibleIndex + 1) % visible.length] : null;
  const rating = getRating(quest);

  setDetailFlip(false);
  stopDetailMotion();
  dom.motionToggle.hidden = !quest.motion;
  dom.motionToggleLabel.textContent = '实况';
  if (quest.motion) {
    dom.detailVideo.src = quest.motion;
  } else {
    dom.detailVideo.removeAttribute('src');
  }

  const reviewState = quest.fromApi && quest.status && quest.status !== 'approved';
  dom.detailReview.hidden = !reviewState;
  if (reviewState) {
    dom.detailReview.className = `detail-review detail-review--${quest.status}`;
    dom.detailReview.textContent = quest.status === 'pending'
      ? '这条投稿正在等待管理员审核，目前只有你和管理员看得到。'
      : `未通过审核：${quest.review_reason || '内容需要调整'}。可以删除后重新投稿。`;
  }

  dom.detailIndex.textContent = `${pad(index + 1)} / ${pad(archive.length)}`;
  dom.detailCategory.textContent = quest.category;
  renderAlbum(quest);
  dom.detailStampDate.textContent = quest.date;
  dom.detailStampPlace.textContent = quest.stamp || 'PERSONAL ARCHIVE';
  dom.detailDate.textContent = quest.date;
  dom.detailTime.textContent = quest.time || '';
  dom.detailTime.hidden = !quest.time;
  dom.detailTimeDot.hidden = !quest.time;
  dom.detailPlace.textContent = quest.place;
  dom.detailTitle.textContent = quest.title;
  dom.detailFeeling.textContent = quest.feeling || '有些时刻来不及描述，只能先把它留下来。';
  dom.detailNote.textContent = CATEGORY_NOTES[quest.category] || CATEGORY_NOTES['校园'];
  if (dom.flipBackMeta) {
    dom.flipBackMeta.textContent = `${quest.date} · ${quest.time || ''} · ${quest.place}`;
    dom.flipBackTitle.textContent = quest.title;
    dom.flipBackFeeling.textContent = quest.feeling || '有些时刻来不及描述，只能先把它留下来。';
    dom.flipBackNote.textContent = CATEGORY_NOTES[quest.category] || CATEGORY_NOTES['校园'];
  }
  dom.detailMine.hidden = !quest.isUser || (quest.fromApi && !quest.is_owner);
  const ownerName = quest.fromApi ? quest.owner_username : null;
  dom.ownerAvatar.hidden = !ownerName;
  if (ownerName) {
    dom.ownerAvatarText.textContent = avatarInitial(ownerName);
    dom.ownerAvatar.style.setProperty('--avatar-hue', String(avatarHue(ownerName)));
    dom.ownerAvatar.setAttribute('aria-label', `查看 @${ownerName} 的主页`);
    dom.ownerAvatar.title = `查看 @${ownerName} 的主页`;
  }
  dom.holdDelete.removeAttribute('data-done');
  dom.holdDelete.removeAttribute('data-holding');
  dom.holdDelete.style.setProperty('--hold-p', '0');
  dom.holdDelete.hidden = true;
  if (quest.fromApi && quest.isUser) {
    dom.holdDeleteText.textContent = quest.is_owner ? '按住 2 秒 · 删除我的投稿' : '按住 2 秒 · 删除这条投稿';
    $('.hold-delete__done', dom.holdDelete).textContent = '已删除投稿';
    if (dom.holdHint) dom.holdHint.textContent = '按住鼠标或手指两秒，确认删除这条投稿。删除后无法恢复。';
  } else {
    dom.holdDeleteText.textContent = quest.isUser ? '按住 2 秒 · 从本机删除' : '按住 2 秒 · 从档案中隐藏';
    $('.hold-delete__done', dom.holdDelete).textContent = quest.isUser ? '已从本机删除' : '已从档案中隐藏';
    if (dom.holdHint) dom.holdHint.textContent = '按住鼠标或手指两秒，确认移除此支线。此操作只影响当前浏览器。';
  }

  dom.detailPrev.disabled = !previous;
  dom.detailNext.disabled = !next;
  dom.detailPrevTitle.textContent = previous ? previous.title : '已是第一条';
  dom.detailNextTitle.textContent = next ? next.title : '已是最后一条';

  dom.ratingAverage.textContent = rating.votes ? rating.avg.toFixed(1) : '—';
  dom.ratingCount.textContent = rating.votes.toLocaleString('zh-CN');
  dom.ratingBars.innerHTML = starsMarkup(rating.avg);
  dom.detailScroll.scrollTop = 0;

  renderRatingCard(quest);
  dom.peekRating.classList.toggle('is-disabled', Boolean(reviewState));
  if (reviewState) {
    dom.ratingNote.textContent = quest.status === 'pending'
      ? '审核通过后开放评分。'
      : '未通过审核的投稿不能评分。';
  }

  document.title = `${quest.title} · 杭电支线`;
}

function stopDetailMotion() {
  if (!dom.detailVideo) return;
  dom.detailVideo.pause();
  dom.detailVideo.hidden = true;
  dom.detailVideo.currentTime = 0;
  dom.detailImage.style.opacity = '';
  dom.reflectiveCard?.classList.remove('is-playing-motion');
  if (dom.motionToggleLabel) dom.motionToggleLabel.textContent = '实况';
}

function toggleDetailMotion() {
  if (!state.activeId) return;
  const quest = findQuest(state.activeId);
  if (!quest?.motion) return;

  if (!dom.detailVideo.hidden) {
    stopDetailMotion();
    return;
  }

  dom.reflectiveCard?.classList.add('is-playing-motion');
  dom.detailImage.style.opacity = '0';
  dom.detailVideo.hidden = false;
  dom.motionToggleLabel.textContent = '关闭实况';
  dom.detailVideo.play().catch(() => {
    showToast('这个实况视频的编码暂时无法播放');
    stopDetailMotion();
  });
}

function questImages(quest) {
  const images = Array.isArray(quest.images) && quest.images.length
    ? quest.images.filter(Boolean)
    : [quest.image].filter(Boolean);
  return images.length ? images : [quest.image];
}

function setDetailFlip(flipped) {
  state.detailFlipped = Boolean(flipped);
  dom.flipCard?.classList.toggle('is-flipped', state.detailFlipped);
  if (dom.flipToggle) {
    dom.flipToggle.innerHTML = state.detailFlipped
      ? '返回照片 <span>↙</span>'
      : '翻到背面 <span>↗</span>';
    dom.flipToggle.setAttribute('aria-pressed', String(state.detailFlipped));
  }
  if (state.detailFlipped) stopDetailMotion();
}

function renderAlbum(quest) {
  const images = questImages(quest);
  if (state.albumQuestId !== quest.id) {
    state.albumQuestId = quest.id;
    state.albumIndex = 0;
  }
  state.albumIndex = clamp(state.albumIndex, 0, images.length - 1);
  const image = images[state.albumIndex];

  dom.detailImage.src = image;
  dom.detailImage.alt = `${quest.title}，拍摄于${quest.place}`;
  dom.albumControls.hidden = images.length < 2;
  dom.albumCounter.textContent = `${state.albumIndex + 1} / ${images.length}`;
  dom.albumStack.innerHTML = '';

  if (images.length > 1) {
    for (let offset = 1; offset <= 2; offset += 1) {
      const ghost = document.createElement('img');
      ghost.className = 'album-ghost';
      ghost.alt = '';
      ghost.style.setProperty('--stack-offset', String(offset));
      ghost.src = images[(state.albumIndex + offset) % images.length];
      dom.albumStack.append(ghost);
    }
  }

  const applyFit = () => requestAnimationFrame(fitDetailFrame);
  if (dom.detailImage.complete && dom.detailImage.naturalWidth) {
    applyFit();
  } else {
    dom.detailImage.addEventListener('load', applyFit, { once: true });
  }
  dom.detailImage.decode?.().then(applyFit).catch(() => {});
}

function fitDetailFrame() {
  if (!detailOpen || !dom.detailVisual || !dom.flipStage || !dom.detailImage) return;
  const naturalWidth = dom.detailImage.naturalWidth;
  const naturalHeight = dom.detailImage.naturalHeight;
  if (!naturalWidth || !naturalHeight) return;

  const visual = dom.detailVisual;
  const style = getComputedStyle(visual);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const mobile = window.matchMedia('(max-width: 860px)').matches;
  const availableWidth = Math.max(120, visual.clientWidth - padX);
  const availableHeight = mobile
    ? Math.max(220, window.innerHeight * 0.62)
    : Math.max(120, visual.clientHeight - padY);
  const ratio = naturalWidth / naturalHeight;

  let width = availableWidth;
  let height = width / ratio;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * ratio;
  }

  dom.flipStage.style.width = `${Math.round(width)}px`;
  dom.flipStage.style.height = `${Math.round(height)}px`;
}

function changeAlbum(direction) {
  const quest = findQuest(state.activeId);
  if (!quest) return;
  const images = questImages(quest);
  if (images.length < 2) return;
  state.albumIndex = (state.albumIndex + direction + images.length) % images.length;
  setDetailFlip(false);
  renderAlbum(quest);
  window.setTimeout(fitDetailFrame, 80);
  dom.detailImage.animate(
    [
      { opacity: 0, transform: 'scale(0.985)' },
      { opacity: 1, transform: 'scale(1)' }
    ],
    { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' }
  );
}

function setupFlipCard() {
  if (!dom.flipBackContent) return;
  if (dom.detailReview && dom.detailReview.parentElement !== dom.flipBackContent) {
    dom.flipBackContent.prepend(dom.detailReview);
  }
  if (dom.ratingCard && dom.ratingCard.parentElement !== dom.flipBackContent) {
    dom.flipBackContent.append(dom.ratingCard);
  }
  dom.flipToggle.addEventListener('click', () => setDetailFlip(!state.detailFlipped));
  dom.detailImage.addEventListener('click', event => {
    event.stopPropagation();
    setDetailFlip(true);
  });
  dom.flipBack.addEventListener('click', event => {
    if (event.target.closest('button, a, input, textarea, .peek-rating, .rating-card')) return;
    event.stopPropagation();
    setDetailFlip(false);
  });
  $('.flip-back__head', dom.flipBack)?.addEventListener('click', event => {
    event.stopPropagation();
    setDetailFlip(false);
  });
  dom.flipCard.addEventListener('click', event => {
    if (event.target.closest('button, a, input, textarea, .peek-rating, .rating-card')) return;
    setDetailFlip(!state.detailFlipped);
  });
  dom.albumPrev.addEventListener('click', () => changeAlbum(-1));
  dom.albumNext.addEventListener('click', () => changeAlbum(1));
  dom.albumStack.addEventListener('click', () => changeAlbum(1));
}

function navigateDetail(direction) {
  const list = normalQuests();
  if (list.length < 2) return;
  const current = list.findIndex(quest => quest.id === state.activeId);
  if (current < 0) return;
  clearPhotoFlight();
  const next = (current + direction + list.length) % list.length;
  renderDetail(list[next]);
  state.activeId = list[next].id;
  setQuestParam(list[next].id);
}

function setQuestParam(id) {
  try {
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set('quest', id);
    } else {
      url.searchParams.delete('quest');
    }
    window.history.replaceState({}, '', url);
  } catch (error) {
    /* file:// and old browsers can reject history updates — not critical */
  }
}

function openDetail(id, sourceImage = null, albumIndex = 0) {
  const quest = findQuest(id);
  if (!quest || state.hidden.has(id)) return;

  if (uploadOpen) closeUpload(true);
  clearPhotoFlight();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sourceFrame = sourceImage
    ? (sourceImage.closest('.quest-card__media') || sourceImage.closest('.gm-tile') || sourceImage)
    : null;
  const sourceRect = sourceFrame ? sourceFrame.getBoundingClientRect() : null;
  const canFly = Boolean(sourceImage && sourceRect && sourceRect.width > 24 && sourceRect.height > 24 && !reduced);

  detailOpen = true;
  state.activeId = id;
  state.albumQuestId = id;
  state.albumIndex = albumIndex;
  setDetailFlip(false);
  state.lastFocus = document.activeElement;
  if (canFly) {
    state.flightPending = true;
    dom.detailImage.style.opacity = '0';
  }
  dom.reflectiveCard?.style.setProperty('--rc-light', '0');
  dom.reflectiveCard?.style.setProperty('--rc-rx', '0deg');
  dom.reflectiveCard?.style.setProperty('--rc-ry', '0deg');
  renderDetail(quest);

  if (canFly) dom.detailLayer.classList.add('is-flying');
  dom.detailLayer.classList.add('is-open');
  dom.detailLayer.setAttribute('aria-hidden', 'false');
  dom.body.classList.add('is-locked');
  setQuestParam(id);
  requestAnimationFrame(fitDetailFrame);

  if (canFly) {
    runPhotoFlight(sourceImage, sourceFrame, sourceRect);
  }

  window.setTimeout(() => {
    dom.detailClose.focus({ preventScroll: true });
  }, 160);
}

function runPhotoFlight(sourceImage, sourceFrame, sourceRect) {
  if (!detailOpen || !dom.detailLayer.classList.contains('is-open')) return;

  const sourceSrc = sourceImage.currentSrc || sourceImage.src;
  if (!sourceSrc) {
    state.flightPending = false;
    dom.detailImage.style.opacity = '';
    dom.detailLayer.classList.remove('is-flying');
    return;
  }

  state.flightPending = false;
  dom.detailImage.style.opacity = '0';

  const clone = document.createElement('img');
  clone.className = 'quest-flight';
  clone.src = sourceSrc;
  clone.alt = '';
  clone.decoding = 'async';
  clone.draggable = false;
  clone.style.left = `${sourceRect.left}px`;
  clone.style.top = `${sourceRect.top}px`;
  clone.style.width = `${sourceRect.width}px`;
  clone.style.height = `${sourceRect.height}px`;
  clone.style.borderRadius = getComputedStyle(sourceFrame).borderRadius || '14px';
  document.body.append(clone);

  const token = Symbol('quest-flight');
  const flight = { token, clone, animation: null, cancelled: false };
  state.flight = flight;

  const targetRect = dom.detailImage.getBoundingClientRect();
  if (!targetRect.width || !targetRect.height) {
    clearPhotoFlight();
    return;
  }
  const targetRadius = getComputedStyle(dom.detailImage).borderRadius || '0px';

  const duration = 640;
  const imageReady = dom.detailImage.complete && dom.detailImage.naturalWidth > 0
    ? Promise.resolve()
    : new Promise(resolve => {
        const done = () => resolve();
        dom.detailImage.addEventListener('load', done, { once: true });
        dom.detailImage.addEventListener('error', done, { once: true });
        window.setTimeout(done, 1400);
      });

  requestAnimationFrame(() => {
    if (!state.flight || state.flight.token !== token || flight.cancelled) return;

    const animation = clone.animate(
      [
        {
          left: `${sourceRect.left}px`,
          top: `${sourceRect.top}px`,
          width: `${sourceRect.width}px`,
          height: `${sourceRect.height}px`,
          borderRadius: clone.style.borderRadius
        },
        {
          left: `${targetRect.left}px`,
          top: `${targetRect.top}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          borderRadius: targetRadius
        }
      ],
      {
        duration,
        easing: 'cubic-bezier(0.22, 0.78, 0.24, 1)',
        fill: 'forwards'
      }
    );

    flight.animation = animation;

    Promise.all([animation.finished.catch(() => {}), imageReady]).then(() => {
      if (!state.flight || state.flight.token !== token || flight.cancelled) return;
      dom.detailImage.style.opacity = '1';
      clone.remove();
      dom.detailLayer.classList.remove('is-flying');
      state.flight = null;
      state.flightPending = false;
    });
  });
}

function clearPhotoFlight() {
  state.flightPending = false;
  if (!state.flight) {
    dom.detailImage.style.opacity = '';
    dom.detailLayer.classList.remove('is-flying');
    return;
  }

  const flight = state.flight;
  state.flight = null;
  flight.cancelled = true;
  try {
    flight.animation?.cancel();
  } catch (error) {
    /* ignore */
  }
  flight.clone?.remove();
  dom.detailImage.style.opacity = '';
  dom.detailLayer.classList.remove('is-flying');
}

function closeDetail(skipFocus = false) {
  if (!detailOpen) return;
  stopDetailMotion();
  setDetailFlip(false);
  clearPhotoFlight();
  detailOpen = false;
  state.activeId = null;
  dom.detailLayer.classList.remove('is-open');
  dom.detailLayer.setAttribute('aria-hidden', 'true');
  if (!uploadOpen) dom.body.classList.remove('is-locked');
  setQuestParam(null);
  document.title = '杭电支线 · HDU SIDE QUESTS';

  if (!skipFocus && state.lastFocus && document.contains(state.lastFocus)) {
    state.lastFocus.focus({ preventScroll: true });
  }
}

function setupReflectiveCard() {
  const card = dom.reflectiveCard;
  if (!card) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  let pointerX = 0.5;
  let pointerY = 0.3;
  let touching = false;

  const paint = () => {
    raf = 0;
    const tiltX = (0.5 - pointerY) * 4.4;
    const tiltY = (pointerX - 0.5) * 5.2;
    card.style.setProperty('--rc-rx', `${tiltX.toFixed(2)}deg`);
    card.style.setProperty('--rc-ry', `${tiltY.toFixed(2)}deg`);
    card.style.setProperty('--rc-gx', `${(pointerX * 100).toFixed(1)}%`);
    card.style.setProperty('--rc-gy', `${(pointerY * 100).toFixed(1)}%`);
    card.style.setProperty('--rc-angle', `${(104 + (pointerX - 0.5) * 48).toFixed(1)}deg`);
  };

  const reset = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    card.style.setProperty('--rc-rx', '0deg');
    card.style.setProperty('--rc-ry', '0deg');
    card.style.setProperty('--rc-light', '0');
  };

  const updatePointer = (x, y) => {
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerX = clamp((x - rect.left) / rect.width, 0, 1);
    pointerY = clamp((y - rect.top) / rect.height, 0, 1);
    card.style.setProperty('--rc-light', '1');
    if (!raf) raf = requestAnimationFrame(paint);
  };

  card.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touching = true;
  }, { passive: true });

  card.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    if (event.pointerType === 'touch' && !touching) return;
    updatePointer(event.clientX, event.clientY);
  }, { passive: true });

  card.addEventListener('touchstart', event => {
    const point = event.touches[0];
    if (!point || reduced.matches) return;
    touching = true;
    updatePointer(point.clientX, point.clientY);
  }, { passive: true });

  card.addEventListener('touchmove', event => {
    const point = event.touches[0];
    if (!point || reduced.matches) return;
    updatePointer(point.clientX, point.clientY);
  }, { passive: true });

  const resetTouch = () => {
    touching = false;
    reset();
  };
  card.addEventListener('touchend', resetTouch, { passive: true });
  card.addEventListener('touchcancel', resetTouch, { passive: true });
  card.addEventListener('pointerup', resetTouch);
  card.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') reset();
  });
  card.addEventListener('pointercancel', event => {
    if (event.pointerType !== 'touch') resetTouch();
  });
  window.addEventListener('blur', reset);
}

function setupDetail() {
  window.addEventListener('resize', () => {
    if (detailOpen) requestAnimationFrame(fitDetailFrame);
  });
  dom.detailClose.addEventListener('click', () => closeDetail());
  $$('[data-close-detail]').forEach(element => {
    element.addEventListener('click', () => closeDetail());
  });

  dom.detailPrev.addEventListener('click', () => navigateDetail(-1));
  dom.detailNext.addEventListener('click', () => navigateDetail(1));
  dom.motionToggle.addEventListener('click', toggleDetailMotion);
  dom.ownerAvatar.addEventListener('click', () => {
    const quest = findQuest(state.activeId);
    if (quest?.owner_username) {
      window.location.href = profileUrl(quest.owner_username);
    }
  });
  dom.detailVideo.addEventListener('error', () => {
    if (!dom.detailVideo.hidden) {
      showToast('这个实况视频的编码暂时无法播放');
      stopDetailMotion();
    }
  });

  dom.detailImage.addEventListener('error', () => {
    if (!state.flight && !state.flightPending) dom.detailImage.style.opacity = '0.15';
  });
  dom.detailImage.addEventListener('load', () => {
    if (!state.flight && !state.flightPending) dom.detailImage.style.opacity = '';
    requestAnimationFrame(fitDetailFrame);
  });

  dom.shareButton.addEventListener('click', async () => {
    const quest = findQuest(state.activeId);
    if (!quest) return;
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('链接已复制，去分享这条支线吧');
    } catch (error) {
      const input = document.createElement('input');
      input.value = shareUrl;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      try {
        document.execCommand('copy');
        showToast('链接已复制，去分享这条支线吧');
      } catch (copyError) {
        showToast('复制失败，请从地址栏复制链接');
      }
      input.remove();
    }
  });

  setupHoldDelete();
}

/* ---------------------------------------------------------
   10. Hold to delete
   --------------------------------------------------------- */

const hold = {
  active: false,
  complete: false,
  raf: 0,
  start: 0,
  pointerId: null
};

function beginHold(event) {
  if (hold.active || hold.complete) return;
  hold.active = true;
  hold.complete = false;
  hold.start = performance.now();
  hold.pointerId = event?.pointerId ?? null;

  if (event && hold.pointerId !== null) {
    try {
      dom.holdDelete.setPointerCapture(hold.pointerId);
    } catch (error) {
      /* ignore */
    }
  }

  dom.holdDelete.setAttribute('data-holding', '');
  dom.holdDelete.style.setProperty('--hold-p', '0');

  const tick = now => {
    if (!hold.active) return;
    const progress = clamp((now - hold.start) / HOLD_MS, 0, 1);
    dom.holdDelete.style.setProperty('--hold-p', progress.toFixed(4));

    if (progress >= 1) {
      completeHold();
      return;
    }
    hold.raf = requestAnimationFrame(tick);
  };

  hold.raf = requestAnimationFrame(tick);
}

function cancelHold() {
  if (!hold.active || hold.complete) return;
  hold.active = false;
  cancelAnimationFrame(hold.raf);
  dom.holdDelete.removeAttribute('data-holding');
  dom.holdDelete.style.setProperty('--hold-p', '0');
}

function completeHold() {
  if (hold.complete) return;
  hold.active = false;
  hold.complete = true;
  cancelAnimationFrame(hold.raf);
  dom.holdDelete.removeAttribute('data-holding');
  dom.holdDelete.setAttribute('data-done', '');
  dom.holdDelete.style.setProperty('--hold-p', '1');

  window.setTimeout(() => {
    const quest = findQuest(state.activeId);
    if (quest) deleteQuest(quest.id);
  }, 380);
}

function setupHoldDelete() {
  dom.holdDelete.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    beginHold(event);
  });

  const end = event => {
    if (!hold.active) return;
    try {
      if (event && event.pointerId != null && dom.holdDelete.hasPointerCapture(event.pointerId)) {
        dom.holdDelete.releasePointerCapture(event.pointerId);
      }
    } catch (error) {
      /* ignore */
    }
    cancelHold();
  };

  dom.holdDelete.addEventListener('pointerup', end);
  dom.holdDelete.addEventListener('pointercancel', end);
  dom.holdDelete.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') cancelHold();
  });

  dom.holdDelete.addEventListener('keydown', event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (event.repeat) return;
    beginHold();
  });

  dom.holdDelete.addEventListener('keyup', event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    cancelHold();
  });

  dom.holdDelete.addEventListener('contextmenu', event => event.preventDefault());
  window.addEventListener('blur', cancelHold);
}

/* ---------------------------------------------------------
   11. Delete / undo / restore / reset
   --------------------------------------------------------- */

async function deleteQuest(id) {
  const quest = findQuest(id);
  if (!quest) return;

  if (detailOpen) closeDetail(true);

  if (quest.fromApi) {
    await deleteServerQuest(quest);
    return;
  }

  if (quest.isUser) {
    state.uploads = state.uploads.filter(item => item.id !== id);
    try {
      await removePersistedUpload(id);
    } catch (error) {
      console.warn('Could not remove the photo from IndexedDB:', error);
    }
    state.lastDeleted = { type: 'upload', quest };
    renderArchive();
    showToast('这条支线已从本机删除', '撤销', undoDelete, 6500);
    return;
  }

  state.hidden.add(id);
  saveHidden();
  state.lastDeleted = { type: 'preset', quest };
  renderArchive();
  showToast('这条支线已从档案中隐藏', '撤销', undoDelete, 6500);
}

async function deleteServerQuest(quest) {
  if (!quest.isUser) {
    state.hidden.add(quest.id);
    saveHidden();
    state.lastDeleted = { type: 'preset', quest };
    renderArchive();
    showToast('这条杭电日常已从本机档案中隐藏', '撤销', undoDelete, 6500);
    return;
  }

  if (!quest.can_delete) {
    showToast('只能删除自己上传的支线');
    return;
  }

  try {
    await apiRequest(`/quests/${encodeURIComponent(quest.id)}`, { method: 'DELETE' });
    state.lastDeleted = null;
    await loadServerQuests();
    renderArchive();
    showToast('这条杭电日常已从共享档案删除');
  } catch (error) {
    console.error('Delete request failed:', error);
    showToast(error.message || '删除失败，请稍后再试');
  }
}

async function undoDelete() {
  if (!state.lastDeleted) return;
  const { type, quest } = state.lastDeleted;
  state.lastDeleted = null;

  if (type === 'preset') {
    state.hidden.delete(quest.id);
    saveHidden();
    renderArchive();
    showToast('已恢复这条支线');
    return;
  }

  state.uploads.unshift(quest);
  try {
    await persistUpload(quest);
    renderArchive();
    showToast('已恢复这条支线');
  } catch (error) {
    state.uploads = state.uploads.filter(item => item.id !== quest.id);
    renderArchive();
    showToast('恢复失败，浏览器存储空间可能不足');
  }
}

function setupFooterActions() {
  dom.restoreHidden.addEventListener('click', () => {
    if (!state.hidden.size) return;
    state.hidden.clear();
    saveHidden();
    renderArchive();
    showToast('被隐藏的支线已全部回到档案');
  });

  dom.resetRatings.addEventListener('click', async () => {
    if (state.serverMode) {
      await resetServerRatings();
      return;
    }
    state.ratings = {};
    saveRatings();
    renderArchive();
    showToast('你的评分已清除，星星重新空着');
  });
}

async function resetServerRatings() {
  if (!state.user) {
    openAuth('rating');
    return;
  }
  const rated = state.serverQuests.filter(quest => Number(quest.my_rating) > 0);
  if (!rated.length) {
    showToast('你还没有在共享档案里留下评分');
    return;
  }

  dom.resetRatings.disabled = true;
  try {
    await Promise.all(rated.map(quest =>
      apiRequest(`/quests/${encodeURIComponent(quest.id)}/rating`, { method: 'DELETE' })
    ));
    await loadServerQuests();
    renderArchive();
    showToast('你在共享档案里的评分已全部清除');
  } catch (error) {
    console.error('Reset ratings failed:', error);
    showToast(error.message || '清除评分失败，请稍后再试');
  } finally {
    dom.resetRatings.disabled = false;
  }
}

/* ---------------------------------------------------------
   12. Toast
   --------------------------------------------------------- */

function showToast(message, actionLabel = '', action = null, duration = 3400) {
  window.clearTimeout(state.toastTimer);
  dom.toastText.textContent = message;

  if (actionLabel && typeof action === 'function') {
    dom.toastAction.hidden = false;
    dom.toastAction.textContent = actionLabel;
    dom.toastAction.onclick = () => {
      hideToast();
      action();
    };
  } else {
    dom.toastAction.hidden = true;
    dom.toastAction.onclick = null;
  }

  dom.toast.classList.add('is-show');
  state.toastTimer = window.setTimeout(hideToast, duration);
}

function hideToast() {
  window.clearTimeout(state.toastTimer);
  dom.toast.classList.remove('is-show');
}

/* ---------------------------------------------------------
   13. Glide Select
   --------------------------------------------------------- */

let glideId = 0;
let activeGlideClose = null;
let categoryPicker = null;
let datePicker = null;

function normalizeGlideOption(option) {
  if (typeof option === 'string') return { value: option, label: option, tag: '' };
  return {
    value: String(option.value ?? option.label ?? ''),
    label: String(option.label ?? option.value ?? ''),
    tag: option.tag ? String(option.tag) : ''
  };
}

function createGlideSelect(root, config = {}) {
  if (!root) return null;

  let items = (config.options || []).map(normalizeGlideOption);
  let current = config.value !== undefined ? String(config.value) : (items[0]?.value ?? '');
  let isOpen = false;
  let activeIndex = -1;
  let menu = null;
  let list = null;
  let pill = null;
  let optionEls = [];
  let closeTimer = 0;
  const id = `glide-${++glideId}`;

  root.classList.add('glide-select');
  root.innerHTML = `
    <button class="glide-select__trigger" type="button" role="combobox" aria-haspopup="listbox"
      aria-expanded="false" aria-controls="${id}-menu" aria-label="${config.ariaLabel || '选择'}">
      <span class="glide-select__label"></span>
      <span class="glide-select__chevron" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.4 4.3 6 7.9l3.6-3.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </button>
    <span class="glide-select__sr" aria-live="polite"></span>
  `;

  const trigger = $('.glide-select__trigger', root);
  const label = $('.glide-select__label', root);
  const sr = $('.glide-select__sr', root);

  const selectedIndex = () => items.findIndex(item => item.value === current);

  const updateLabel = () => {
    const index = selectedIndex();
    const selected = items[index];
    label.textContent = selected ? selected.label : (config.placeholder || '请选择');
    label.toggleAttribute('data-empty', !selected);
    sr.textContent = `${config.ariaLabel || '选择'}：${selected ? selected.label : '未选择'}`;
  };

  const positionMenu = () => {
    if (!menu || !isOpen) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, Number(config.menuWidth) || 0), window.innerWidth - 16);
    menu.style.width = `${width}px`;
    const height = menu.offsetHeight;
    const gap = 6;
    let top = rect.bottom + gap;
    let side = 'bottom';
    if (top + height > window.innerHeight - 8 && rect.top - height - gap > 8) {
      top = rect.top - height - gap;
      side = 'top';
    }
    top = clamp(top, 8, Math.max(8, window.innerHeight - height - 8));
    let left = config.align === 'right' ? rect.right - width : rect.left;
    left = clamp(left, 8, Math.max(8, window.innerWidth - width - 8));
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.transformOrigin = `${side === 'bottom' ? 'top' : 'bottom'} ${config.align === 'right' ? 'right' : 'left'}`;
  };

  const paintSelection = () => {
    if (!menu) return;
    optionEls.forEach((option, index) => {
      option.setAttribute('aria-selected', String(index === selectedIndex()));
      const check = $('.glide-select__check', option);
      if (check) check.toggleAttribute('data-on', index === selectedIndex());
    });
  };

  const setActive = (index, instant = false, scroll = false) => {
    if (!menu || !optionEls.length) return;
    activeIndex = clamp(index, 0, optionEls.length - 1);
    optionEls.forEach((option, optionIndex) => {
      option.classList.toggle('is-active', optionIndex === activeIndex);
    });
    trigger.setAttribute('aria-activedescendant', optionEls[activeIndex].id);
    if (pill) {
      const row = optionEls[0].offsetHeight || 34;
      if (instant) pill.style.transition = 'none';
      pill.style.transform = `translateY(${activeIndex * (row + 1)}px)`;
      pill.style.opacity = '1';
      if (instant) {
        void pill.offsetHeight;
        pill.style.transition = '';
      }
    }
    if (scroll) {
      const option = optionEls[activeIndex];
      const top = option.offsetTop;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (top + option.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = top + option.offsetHeight - list.clientHeight;
      }
    }
  };

  const buildMenu = () => {
    menu = document.createElement('div');
    menu.className = 'glide-select__menu';
    menu.id = `${id}-menu`;
    menu.setAttribute('role', 'presentation');
    menu.style.setProperty('--gs-row', '34px');
    menu.style.setProperty('--gs-inner-radius', '7px');
    menu.style.setProperty('--gs-radius', '10px');

    list = document.createElement('div');
    list.className = 'glide-select__list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', config.ariaLabel || '选择');

    pill = document.createElement('span');
    pill.className = 'glide-select__pill';
    pill.setAttribute('aria-hidden', 'true');
    list.append(pill);

    optionEls = items.map((item, index) => {
      const option = document.createElement('div');
      option.className = 'glide-select__option';
      option.id = `${id}-option-${index}`;
      option.dataset.index = String(index);
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(item.value === current));

      const name = document.createElement('span');
      name.className = 'glide-select__name';
      name.textContent = item.label;
      option.append(name);

      if (item.tag) {
        const tag = document.createElement('span');
        tag.className = 'glide-select__tag';
        tag.textContent = item.tag;
        option.append(tag);
      }

      const check = document.createElement('span');
      check.className = 'glide-select__check';
      if (item.value === current) check.setAttribute('data-on', '');
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      option.append(check);

      return option;
    });

    list.append(...optionEls);
    menu.append(list);
    document.body.append(menu);

    list.addEventListener('pointerover', event => {
      const option = event.target.closest('.glide-select__option');
      if (!option) return;
      if (event.pointerType === 'touch') return;
      setActive(Number(option.dataset.index));
    });

    list.addEventListener('click', event => {
      const option = event.target.closest('.glide-select__option');
      if (!option) return;
      choose(Number(option.dataset.index));
    });

    menu.addEventListener('pointerdown', event => event.stopPropagation());
    paintSelection();
  };

  const removeMenu = () => {
    if (!menu) return;
    const oldMenu = menu;
    menu = null;
    list = null;
    pill = null;
    optionEls = [];
    oldMenu.classList.remove('is-open');
    window.setTimeout(() => oldMenu.remove(), 200);
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    window.clearTimeout(closeTimer);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    root.removeAttribute('data-open');
    document.removeEventListener('pointerdown', onOutsideDown, true);
    document.removeEventListener('scroll', positionMenu, true);
    window.removeEventListener('resize', positionMenu);
    removeMenu();
    if (activeGlideClose === close) activeGlideClose = null;
  };

  const choose = index => {
    const item = items[index];
    if (!item) return;
    const changed = item.value !== current;
    current = item.value;
    updateLabel();
    paintSelection();
    if (changed) {
      root.setAttribute('data-swap', '');
      window.setTimeout(() => root.removeAttribute('data-swap'), 220);
      config.onChange?.(current, item);
    }
    close();
    trigger.focus({ preventScroll: true });
  };

  const open = () => {
    if (isOpen) return;
    if (activeGlideClose) activeGlideClose();
    isOpen = true;
    trigger.setAttribute('aria-expanded', 'true');
    root.setAttribute('data-open', '');
    buildMenu();
    positionMenu();
    const selected = selectedIndex();
    setActive(selected >= 0 ? selected : 0, true, true);
    requestAnimationFrame(() => menu?.classList.add('is-open'));
    document.addEventListener('pointerdown', onOutsideDown, true);
    document.addEventListener('scroll', positionMenu, true);
    window.addEventListener('resize', positionMenu);
    activeGlideClose = close;
  };

  function onOutsideDown(event) {
    if (root.contains(event.target) || (menu && menu.contains(event.target))) return;
    close();
  }

  const setValue = value => {
    current = String(value);
    updateLabel();
    paintSelection();
    if (isOpen) close();
  };

  const setOptions = (options, value) => {
    if (isOpen) close();
    items = (options || []).map(normalizeGlideOption);
    if (value !== undefined) current = String(value);
    if (!items.some(item => item.value === current)) current = items[0]?.value ?? '';
    updateLabel();
  };

  updateLabel();

  trigger.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    root.classList.add('is-pointer');
    trigger.focus({ preventScroll: true });
    if (isOpen) close();
    else open();
  });

  trigger.addEventListener('keydown', event => {
    root.classList.remove('is-pointer');
    const key = event.key;
    if (!isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const start = activeIndex < 0 ? Math.max(0, selectedIndex()) : activeIndex;
      setActive(start + (key === 'ArrowDown' ? 1 : -1), false, true);
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      setActive(key === 'Home' ? 0 : items.length - 1, false, true);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      choose(activeIndex);
    } else if (key === 'Escape' || key === 'Tab') {
      if (key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      close();
    }
  });

  return {
    getValue: () => current,
    setValue,
    setOptions,
    close,
    root,
    trigger
  };
}

function setupGlideSelects() {
  if (!dom.categoryGlide || !dom.dateYear || !dom.dateMonth || !dom.dateDay) return;

  categoryPicker = createGlideSelect(dom.categoryGlide, {
    options: CATEGORIES.map(category => ({ value: category, label: category })),
    value: '校园',
    ariaLabel: '选择图片类目',
    onChange: value => {
      dom.fieldCategory.value = value;
    }
  });
  dom.fieldCategory.value = '校园';

  const today = new Date();
  const stateDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate()
  };

  const yearNow = today.getFullYear();
  const years = Array.from({ length: 42 }, (_, index) => yearNow - index);
  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return { value: String(month), label: `${month}月`, tag: month === today.getMonth() + 1 ? '本月' : '' };
  });

  const syncDate = () => {
    dom.fieldDate.value = `${stateDate.year}-${pad(stateDate.month)}-${pad(stateDate.day)}`;
  };

  const dayOptions = () => {
    const total = new Date(stateDate.year, stateDate.month, 0).getDate();
    if (stateDate.day > total) stateDate.day = total;
    return Array.from({ length: total }, (_, index) => {
      const day = index + 1;
      const weekday = new Date(stateDate.year, stateDate.month - 1, day).toLocaleDateString('zh-CN', { weekday: 'short' });
      return {
        value: String(day),
        label: `${pad(day)}日`,
        tag: day === today.getDate() && stateDate.month === today.getMonth() + 1 && stateDate.year === today.getFullYear() ? '今天' : weekday
      };
    });
  };

  const yearPicker = createGlideSelect(dom.dateYear, {
    options: years.map(year => ({ value: String(year), label: String(year), tag: year === yearNow ? '今年' : '' })),
    value: String(stateDate.year),
    ariaLabel: '选择拍摄年份',
    menuWidth: 120,
    onChange: value => {
      stateDate.year = Number(value);
      refreshDays();
    }
  });

  const monthPicker = createGlideSelect(dom.dateMonth, {
    options: monthOptions,
    value: String(stateDate.month),
    ariaLabel: '选择拍摄月份',
    menuWidth: 108,
    onChange: value => {
      stateDate.month = Number(value);
      refreshDays();
    }
  });

  let dayPicker = null;
  const refreshDays = () => {
    const options = dayOptions();
    dayPicker.setOptions(options, String(stateDate.day));
    syncDate();
  };

  dayPicker = createGlideSelect(dom.dateDay, {
    options: dayOptions(),
    value: String(stateDate.day),
    ariaLabel: '选择拍摄日期',
    menuWidth: 112,
    onChange: value => {
      stateDate.day = Number(value);
      syncDate();
    }
  });

  const setDate = iso => {
    const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    const date = parsed ? new Date(Number(parsed[1]), Number(parsed[2]) - 1, Number(parsed[3])) : new Date();
    stateDate.year = date.getFullYear();
    stateDate.month = date.getMonth() + 1;
    stateDate.day = date.getDate();
    if (!years.includes(stateDate.year)) {
      years.unshift(stateDate.year);
      yearPicker.setOptions(
        years.map(year => ({ value: String(year), label: String(year), tag: year === yearNow ? '今年' : '' })),
        String(stateDate.year)
      );
    } else {
      yearPicker.setValue(String(stateDate.year));
    }
    monthPicker.setValue(String(stateDate.month));
    refreshDays();
    dayPicker.setValue(String(stateDate.day));
    syncDate();
  };

  datePicker = { setDate };
  setDate(todayISO());
}

function closeAllGlideSelects() {
  if (activeGlideClose) activeGlideClose();
}

/* ---------------------------------------------------------
   14. Upload
   --------------------------------------------------------- */

function openUpload() {
  if (uploadOpen) return;
  if (state.serverMode && !state.user) {
    openAuth('upload');
    return;
  }
  if (detailOpen) closeDetail(true);

  resetUploadForm();
  uploadOpen = true;
  state.lastFocus = document.activeElement;
  dom.uploadNo.textContent = `/ ${pad(allQuests().length + 1)}`;
  dom.uploadLayer.classList.add('is-open');
  dom.uploadLayer.setAttribute('aria-hidden', 'false');
  dom.body.classList.add('is-locked');

  window.setTimeout(() => {
    dom.dropzone.focus({ preventScroll: true });
  }, 160);
}

function closeUpload(skipFocus = false) {
  if (!uploadOpen) return;
  closeAllGlideSelects();
  uploadOpen = false;
  dom.uploadLayer.classList.remove('is-open');
  dom.uploadLayer.setAttribute('aria-hidden', 'true');
  if (!detailOpen) dom.body.classList.remove('is-locked');
  if (!skipFocus && state.lastFocus && document.contains(state.lastFocus)) {
    state.lastFocus.focus({ preventScroll: true });
  }
}

function resetUploadForm() {
  state.pendingImage = '';
  state.pendingFile = null;
  state.pendingImages = [];
  state.pendingMotion = null;
  dom.uploadForm.reset();
  dom.fieldDate.value = todayISO();
  dom.fieldTime.value = currentTime();
  dom.fieldCategory.value = '校园';
  categoryPicker?.setValue('校园');
  datePicker?.setDate(todayISO());
  dom.fileInput.value = '';
  dom.uploadMotionChip.hidden = true;
  dom.uploadMotionName.textContent = '';
  dom.dropEmpty.hidden = false;
  dom.dropPreview.hidden = true;
  dom.albumPreview.hidden = true;
  dom.uploadAlbumStack.innerHTML = '';
  dom.previewImg.removeAttribute('src');
  dom.dropzone.classList.remove('is-invalid', 'is-dragging');
  $('.field', dom.uploadForm)?.classList.remove('is-invalid');
  $$('.field', dom.uploadForm).forEach(field => field.classList.remove('is-invalid'));
  dom.feelingCount.textContent = '0';
  dom.publishButton.disabled = false;
  $('.publish-button__label', dom.publishButton).textContent = '发射这条杭电支线';
}

function setupUpload() {
  $$('.js-open-upload').forEach(button => button.addEventListener('click', openUpload));

  dom.uploadClose.addEventListener('click', () => closeUpload());
  $$('[data-close-upload]').forEach(element => element.addEventListener('click', () => closeUpload()));

  dom.fileInput.addEventListener('change', event => {
    handleFiles(event.target.files);
  });

  dom.albumClear.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    clearUploadSelection();
  });

  dom.dropzone.addEventListener('click', event => {
    if (event.target === dom.replaceFile || dom.replaceFile.contains(event.target)) {
      event.preventDefault();
      dom.fileInput.click();
    }
  });

  dom.replaceFile.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    dom.fileInput.click();
  });

  ['dragenter', 'dragover'].forEach(name => {
    dom.dropzone.addEventListener(name, event => {
      event.preventDefault();
      dom.dropzone.classList.add('is-dragging');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dom.dropzone.addEventListener(name, event => {
      event.preventDefault();
      dom.dropzone.classList.remove('is-dragging');
    });
  });

  dom.dropzone.addEventListener('drop', event => {
    handleFiles(event.dataTransfer?.files);
  });

  dom.dropzone.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dom.fileInput.click();
    }
  });

  dom.fieldFeeling.addEventListener('input', () => {
    dom.feelingCount.textContent = String(dom.fieldFeeling.value.length);
  });

  dom.fieldTitle.addEventListener('input', () => {
    dom.fieldTitle.closest('.field').classList.remove('is-invalid');
  });

  dom.uploadForm.addEventListener('submit', async event => {
    event.preventDefault();
    await submitUpload();
  });
}

function isImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|jfif|jpe|pjpeg|pjp|png|webp|gif|avif|bmp|heic|heif)$/i.test(file.name);
}

function isHeicFile(file) {
  if (!file) return false;
  return /^image\/(heic|heif)$/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

function isMotionFile(file) {
  if (!file) return false;
  return file.type === 'video/mp4'
    || file.type === 'video/quicktime'
    || /\.(mp4|mov)$/i.test(file.name);
}

async function prepareImage(file) {
  if (!isImageFile(file)) throw new Error('请选择 JPG、PNG、WEBP、GIF 或 AVIF 图片');
  if (file.size > MAX_FILE_BYTES) throw new Error('照片超过 20MB，换一张小一点的吧');

  if (isHeicFile(file)) {
    if (!state.serverMode) throw new Error('HEIC 需要连接 FastAPI 后才能转换，请先启动后端');
    return { file, preview: heicPlaceholder(file.name), dataUrl: '', note: 'HEIC，服务端转换' };
  }

  try {
    const dataUrl = await compressImage(file);
    return { file, preview: dataUrl, dataUrl, note: '已优化' };
  } catch (error) {
    console.error(error);
    if (!state.serverMode) throw new Error('照片处理失败，请换一张 JPG、PNG 或 HEIC 试试');
    return { file, preview: serverImagePlaceholder(file), dataUrl: '', note: '服务端压缩' };
  }
}

async function handleFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  dom.dropzone.classList.remove('is-invalid');
  const strong = $('strong', dom.dropEmpty);
  const originalStrong = strong?.textContent;
  if (strong) strong.textContent = files.length > 1 ? `正在识别 ${files.length} 个文件…` : '正在识别文件…';
  dom.dropEmpty.style.opacity = '0.55';

  const imageFiles = [];
  let motionFile = null;
  const errors = [];
  let overflow = false;

  files.forEach(file => {
    if (isMotionFile(file)) {
      if (motionFile) {
        errors.push('一次只支持一段实况视频');
        return;
      }
      if (!state.serverMode) {
        errors.push('实况视频需要连接 FastAPI 后才能保存');
        return;
      }
      if (file.size > 60 * 1024 * 1024) {
        errors.push('实况视频超过 60MB，换一段短一点的吧');
        return;
      }
      motionFile = file;
      return;
    }
    if (!isImageFile(file)) {
      errors.push(`${file.name}：只支持图片或 MP4 / MOV 实况`);
      return;
    }
    if (imageFiles.length >= 9) {
      overflow = true;
      return;
    }
    imageFiles.push(file);
  });

  const prepared = [];
  for (const file of imageFiles) {
    try {
      prepared.push(await prepareImage(file));
    } catch (error) {
      errors.push(`${file.name}：${error.message}`);
    }
  }

  if (prepared.length) {
    state.pendingImages = prepared;
    state.pendingMotion = motionFile;
    state.pendingImage = prepared.length === 1 ? prepared[0].dataUrl : '';
    state.pendingFile = prepared.length === 1 && !prepared[0].dataUrl ? prepared[0].file : null;
    renderUploadSelection();
    if (overflow) showToast('一次最多收录 9 张照片，超出的已忽略');
    if (errors.length) showToast(errors[0]);
  } else if (motionFile) {
    dom.dropzone.classList.add('is-invalid');
    showToast('实况视频需要同时选择至少一张照片');
  } else if (errors.length) {
    dom.dropzone.classList.add('is-invalid');
    showToast(errors[0]);
  }

  if (strong && originalStrong) strong.textContent = originalStrong;
  dom.dropEmpty.style.opacity = '';
  dom.fileInput.value = '';
}

function renderUploadSelection() {
  const items = state.pendingImages;
  dom.dropEmpty.hidden = items.length > 0;
  dom.uploadMotionChip.hidden = !state.pendingMotion;
  if (state.pendingMotion) {
    dom.uploadMotionName.textContent = `${state.pendingMotion.name} · ${(state.pendingMotion.size / 1024 / 1024).toFixed(1)} MB`;
  }

  if (!items.length) {
    dom.dropPreview.hidden = true;
    dom.albumPreview.hidden = true;
    dom.uploadAlbumStack.innerHTML = '';
    dom.previewImg.removeAttribute('src');
    return;
  }

  if (items.length === 1) {
    const item = items[0];
    dom.dropPreview.hidden = false;
    dom.albumPreview.hidden = true;
    dom.previewImg.src = item.preview;
    dom.fileName.textContent = item.file.name;
    dom.fileMeta.textContent = `${(item.file.size / 1024 / 1024).toFixed(1)} MB · ${item.note}`;
    return;
  }

  dom.dropPreview.hidden = true;
  dom.albumPreview.hidden = false;
  dom.uploadAlbumCount.textContent = `${items.length} 张`;
  dom.uploadAlbumStack.innerHTML = '';
  items.slice(0, 3).forEach((item, index) => {
    const img = document.createElement('img');
    img.src = item.preview;
    img.alt = '';
    img.style.setProperty('--album-index', String(index));
    dom.uploadAlbumStack.append(img);
  });
}

function clearUploadSelection() {
  state.pendingImages = [];
  state.pendingImage = '';
  state.pendingFile = null;
  state.pendingMotion = null;
  dom.fileInput.value = '';
  dom.dropPreview.hidden = true;
  dom.albumPreview.hidden = true;
  dom.uploadMotionChip.hidden = true;
  dom.uploadMotionName.textContent = '';
  dom.previewImg.removeAttribute('src');
  dom.uploadAlbumStack.innerHTML = '';
  dom.dropEmpty.hidden = false;
  dom.dropEmpty.style.opacity = '';
  const strong = $('strong', dom.dropEmpty);
  if (strong) strong.textContent = '把照片拖进来';
}

function heicPlaceholder(name) {
  const label = escapeHTML(name).slice(0, 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675"><rect width="900" height="675" fill="#17130f"/><text x="450" y="320" text-anchor="middle" fill="#4d7cff" font-family="monospace" font-size="26" letter-spacing="6">HEIC</text><text x="450" y="365" text-anchor="middle" fill="#9b9386" font-family="monospace" font-size="16">${label}</text><text x="450" y="405" text-anchor="middle" fill="#6f685e" font-family="monospace" font-size="13">服务端将转换为 JPEG</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function serverImagePlaceholder(file) {
  const name = escapeHTML(file.name).slice(0, 28);
  const type = (file.type || file.name.split('.').pop() || 'IMAGE').toUpperCase().slice(0, 12);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675"><rect width="900" height="675" fill="#17130f"/><text x="450" y="318" text-anchor="middle" fill="#4d7cff" font-family="monospace" font-size="28" letter-spacing="4">${type}</text><text x="450" y="362" text-anchor="middle" fill="#9b9386" font-family="monospace" font-size="16">${name}</text><text x="450" y="403" text-anchor="middle" fill="#6f685e" font-family="monospace" font-size="13">浏览器无法预览，将由服务端压缩</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    let settled = false;
    const timeout = window.setTimeout(() => fail(new Error('Image decode timed out')), 15000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
    };
    const fail = error => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    image.onload = () => {
      try {
        if (!image.naturalWidth || !image.naturalHeight) {
          fail(new Error('Image has no dimensions'));
          return;
        }
        const maxSide = 1800;
        const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) {
          fail(new Error('Canvas 2D is unavailable'));
          return;
        }
        context.fillStyle = '#0d0b09';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
        if (!dataUrl || !dataUrl.startsWith('data:image/jpeg') || dataUrl.length < 128) {
          fail(new Error('Empty canvas export'));
          return;
        }
        settled = true;
        cleanup();
        resolve(dataUrl);      } catch (error) {
        fail(error);
      }
    };
    image.onerror = () => fail(new Error('Image could not be decoded'));
    image.src = objectUrl;
  });
}

async function submitUpload() {
  const title = dom.fieldTitle.value.trim();
  const place = dom.fieldPlace.value.trim();
  const feeling = dom.fieldFeeling.value.trim();
  const dateISO = dom.fieldDate.value || todayISO();

  if (!state.pendingImage && !state.pendingFile && !state.pendingImages.length) {
    dom.dropzone.classList.add('is-invalid');
    dom.dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('先放一张照片进来，支线才有入口');
    return;
  }

  if (!title) {
    dom.fieldTitle.closest('.field').classList.add('is-invalid');
    dom.fieldTitle.focus();
    showToast('给这条支线起一个名字吧');
    return;
  }

  if (state.serverMode) {
    await submitServerUpload({ title, place, feeling, dateISO });
    return;
  }

  const quest = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    date: isoToDisplay(dateISO),
    iso: dateISO,
    time: dom.fieldTime.value || currentTime(),
    place: place || '某个不知名的地方',
    stamp: `PERSONAL ARCHIVE · ${isoToDisplay(dateISO)}`,
    category: CATEGORIES.includes(dom.fieldCategory.value) ? dom.fieldCategory.value : '校园',
    feeling: feeling || '有些时刻来不及描述，只能先把它留下来。',
    image: state.pendingImage || state.pendingImages[0]?.dataUrl || '',
    images: state.pendingImages.map(item => item.dataUrl).filter(Boolean),
    baseScore: 0,
    baseVotes: 0,
    isUser: true,
    createdAt: Date.now()
  };

  dom.publishButton.disabled = true;
  $('.publish-button__label', dom.publishButton).textContent = '正在发射…';

  try {
    await persistUpload(quest);
    state.uploads.unshift(quest);
    state.filter = 'all';
    $$('.filter', dom.filters).forEach(button => button.classList.toggle('is-active', button.dataset.filter === 'all'));
    closeUpload(true);
    renderArchive();
    showToast('支线已加入档案，背景里多了一张照片', '打开', () => openDetail(quest.id), 5200);
  } catch (error) {
    console.error(error);
    dom.publishButton.disabled = false;
    $('.publish-button__label', dom.publishButton).textContent = '发射这条杭电支线';
    showToast('保存失败，浏览器存储空间可能不足');
  }
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = String(dataUrl).split(',');
  const mime = /data:([^;]+)/.exec(header)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

async function submitServerUpload({ title, place, feeling, dateISO }) {
  dom.publishButton.disabled = true;
  $('.publish-button__label', dom.publishButton).textContent = state.pendingMotion
    ? '正在转码并提交审核…'
    : '正在提交审核…';

  try {
    const form = new FormData();
    form.append('title', title);
    form.append('shot_date', dateISO);
    form.append('shot_time', dom.fieldTime.value || currentTime());
    form.append('place', place || '杭电 · 未命名地点');
    form.append('feeling', feeling || '有些时刻来不及描述，只能先把它留下来。');
    form.append('category', CATEGORIES.includes(dom.fieldCategory.value) ? dom.fieldCategory.value : '校园');
    const prepared = state.pendingImages.length
      ? state.pendingImages
      : [{
          file: state.pendingFile,
          dataUrl: state.pendingImage,
          preview: state.pendingImage,
          note: ''
        }];
    for (const item of prepared) {
      const imageBlob = item.file || dataUrlToBlob(item.dataUrl);
      form.append('images', imageBlob, item.file?.name || 'hdu-daily.jpg');
    }
    if (state.pendingMotion) {
      form.append('motion', state.pendingMotion, state.pendingMotion.name || 'hdu-motion.mp4');
    }

    const response = await apiRequest('/quests', {
      method: 'POST',
      body: form,
      timeoutMs: 200000
    });
    const quest = await response.json();

    state.filter = 'all';
    $$('.filter', dom.filters).forEach(button => button.classList.toggle('is-active', button.dataset.filter === 'all'));
    closeUpload(true);
    await loadServerQuests();
    renderArchive();
    showToast(
      quest.status === 'pending'
        ? '投稿已提交，等待管理员审核'
        : '这条杭电日常已加入共享档案',
      '打开',
      () => openDetail(quest.id),
      5200
    );
  } catch (error) {
    console.error('Upload request failed:', error);
    dom.publishButton.disabled = false;
    $('.publish-button__label', dom.publishButton).textContent = '发射这条杭电支线';
    showToast(error.message || '上传失败，请检查 FastAPI 是否在运行');
  }
}

/* ---------------------------------------------------------
   14. Sling upload button
   --------------------------------------------------------- */

function setupSling() {
  const sling = {
    dragging: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    armed: false
  };

  const maxPull = 56;
  const armAt = 34;

  const setBands = (x, y) => {
    const distance = Math.hypot(x, y);
    if (distance < 5) {
      dom.slingBandA.setAttribute('d', '');
      dom.slingBandB.setAttribute('d', '');
      dom.slingArc.style.opacity = '0';
      return;
    }

    const wellRadius = 43;
    const padRadius = 38.5;
    const angle = Math.atan2(y, x);
    const tangent = Math.acos(clamp((wellRadius - padRadius) / distance, -1, 1));
    const paths = [1, -1].map(direction => {
      const theta = angle + tangent * direction;
      const startX = wellRadius * Math.cos(theta);
      const startY = wellRadius * Math.sin(theta);
      const endX = x + padRadius * Math.cos(theta);
      const endY = y + padRadius * Math.sin(theta);
      return `M${startX.toFixed(2)},${startY.toFixed(2)} L${endX.toFixed(2)},${endY.toFixed(2)}`;
    });

    dom.slingBandA.setAttribute('d', paths[0]);
    dom.slingBandB.setAttribute('d', paths[1]);

    const power = clamp(distance / maxPull, 0, 1);
    dom.slingBandB.style.opacity = String(power);
    dom.slingArc.style.opacity = power > 0.03 ? '1' : '0';
    dom.slingArc.style.strokeDasharray = `${power.toFixed(3)} 1`;
  };

  const moveTo = (x, y) => {
    const rawDistance = Math.hypot(x, y);
    const distance = maxPull * Math.tanh(rawDistance / maxPull);
    const ux = rawDistance > 0 ? x / rawDistance : 0;
    const uy = rawDistance > 0 ? y / rawDistance : 0;
    const nx = ux * distance;
    const ny = uy * distance;

    sling.x = nx;
    sling.y = ny;
    dom.slingPad.style.setProperty('--sx', `${nx.toFixed(2)}px`);
    dom.slingPad.style.setProperty('--sy', `${ny.toFixed(2)}px`);
    setBands(nx, ny);

    const armed = distance >= armAt;
    if (armed !== sling.armed) {
      sling.armed = armed;
      dom.slingPad.toggleAttribute('data-armed', armed);
    }
  };

  const reset = () => {
    sling.dragging = false;
    sling.moved = false;
    sling.pointerId = null;
    sling.armed = false;
    dom.slingPad.removeAttribute('data-held');
    dom.slingPad.removeAttribute('data-armed');
    dom.slingPad.style.setProperty('--sx', '0px');
    dom.slingPad.style.setProperty('--sy', '0px');
    dom.slingArc.style.opacity = '0';
    dom.slingBandA.setAttribute('d', '');
    dom.slingBandB.setAttribute('d', '');
    sling.x = 0;
    sling.y = 0;
  };

  const burst = () => {
    const colors = ['#4d7cff', '#f2eee5', '#e7b36a'];
    for (let index = 0; index < 16; index += 1) {
      const dot = document.createElement('span');
      dot.className = 'sling__burst';
      dot.style.background = colors[index % colors.length];
      dom.sling.append(dot);
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 95;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = 3 + Math.random() * 4;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(.15)`, opacity: 0 }
        ],
        { duration: 560 + Math.random() * 280, easing: 'cubic-bezier(.18,.7,.25,1)', fill: 'forwards' }
      ).finished.then(() => dot.remove()).catch(() => dot.remove());
    }
  };

  dom.slingPad.addEventListener('pointerdown', event => {
    if (event.button !== 0 || sling.dragging) return;
    event.preventDefault();
    sling.dragging = true;
    sling.pointerId = event.pointerId;
    sling.startX = event.clientX;
    sling.startY = event.clientY;
    sling.moved = false;
    sling.armed = false;
    dom.slingPad.setAttribute('data-held', '');
    dom.slingPad.style.transition = 'none';
    try {
      dom.slingPad.setPointerCapture(event.pointerId);
    } catch (error) {
      /* ignore */
    }
  });

  dom.slingPad.addEventListener('pointermove', event => {
    if (!sling.dragging || event.pointerId !== sling.pointerId) return;
    const dx = event.clientX - sling.startX;
    const dy = event.clientY - sling.startY;
    if (!sling.moved && Math.hypot(dx, dy) > 5) {
      sling.moved = true;
      sling.startX = event.clientX - dx;
      sling.startY = event.clientY - dy;
    }
    if (sling.moved) moveTo(dx, dy);
  });

  const release = event => {
    if (!sling.dragging || event.pointerId !== sling.pointerId) return;
    const fire = sling.armed;
    const tapped = !sling.moved;
    const pointerId = sling.pointerId;

    sling.dragging = false;
    sling.pointerId = null;
    try {
      if (dom.slingPad.hasPointerCapture(pointerId)) {
        dom.slingPad.releasePointerCapture(pointerId);
      }
    } catch (error) {
      /* ignore */
    }

    dom.slingPad.removeAttribute('data-held');
    dom.slingPad.removeAttribute('data-armed');
    dom.slingPad.style.transition = '';
    dom.slingPad.style.setProperty('--sx', '0px');
    dom.slingPad.style.setProperty('--sy', '0px');
    dom.slingArc.style.opacity = '0';
    dom.slingBandA.setAttribute('d', '');
    dom.slingBandB.setAttribute('d', '');
    sling.armed = false;

    if (fire) {
      burst();
      window.setTimeout(openUpload, 190);
    } else if (tapped) {
      openUpload();
    }
  };

  dom.slingPad.addEventListener('pointerup', release);
  dom.slingPad.addEventListener('pointercancel', () => {
    sling.dragging = false;
    dom.slingPad.removeAttribute('data-held');
    dom.slingPad.removeAttribute('data-armed');
    dom.slingPad.style.transition = '';
    dom.slingPad.style.setProperty('--sx', '0px');
    dom.slingPad.style.setProperty('--sy', '0px');
    dom.slingArc.style.opacity = '0';
    dom.slingBandA.setAttribute('d', '');
    dom.slingBandB.setAttribute('d', '');
  });

  dom.slingPad.addEventListener('click', event => {
    if (event.detail === 0) openUpload();
  });
}

/* ---------------------------------------------------------
   15. Click spark + cards / reveal setup
   --------------------------------------------------------- */

function setupSparkCanvas() {
  const canvas = dom.sparkCanvas;
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const particles = [];
  let raf = 0;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life -= 0.022;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.965;
      particle.vy *= 0.965;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      context.fillStyle = `rgba(${particle.color}, ${particle.life})`;
      context.fill();
    }
    if (particles.length) {
      raf = requestAnimationFrame(draw);
    } else {
      raf = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('pointerdown', event => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (event.pointerType === 'touch') return;
    if (event.target.closest('input, textarea, select')) return;

    const count = 9;
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count + Math.random() * 0.35;
      const speed = 1.5 + Math.random() * 2.8;
      particles.push({
        x: event.clientX,
        y: event.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 1.5 + Math.random() * 2,
        color: index % 3 === 0 ? '77, 124, 255' : '242, 238, 229'
      });
    }

    if (!raf) raf = requestAnimationFrame(draw);
  });
}

function setupReveals() {
  $$('.reveal').forEach(element => {
    if (element.dataset.delay) element.style.setProperty('--delay', `${element.dataset.delay}ms`);
    observeReveal(element);
  });
}

/* ---------------------------------------------------------
   16. Global keyboard / focus
   --------------------------------------------------------- */

function getFocusable(container) {
  return $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container)
    .filter(element => element.offsetParent !== null);
}

function setupGlobalKeys() {
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (activeGlideClose) {
        event.stopPropagation();
        activeGlideClose();
        return;
      }
      if (!dom.adminPreview.hidden) {
        closeAdminPreview();
        return;
      }
      if (adminOpen) {
        closeAdmin();
        return;
      }
      if (authOpen) {
        closeAuth();
        return;
      }
      if (uploadOpen) {
        closeUpload();
        return;
      }
      if (detailOpen) {
        closeDetail();
        return;
      }
      if (dom.mobileMenu.classList.contains('is-open')) {
        dom.menuButton.click();
      }
      return;
    }

    if (detailOpen && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      if (event.target.closest('input, textarea, select, .peek-rating')) return;
      const opened = findQuest(state.activeId);
      const images = opened ? questImages(opened) : [];
      if (images.length > 1) {
        event.preventDefault();
        changeAlbum(event.key === 'ArrowRight' ? 1 : -1);
        return;
      }
    }

    if (event.key !== 'Tab') return;

    const layer = adminOpen
      ? dom.adminLayer
      : authOpen
        ? dom.authLayer
        : uploadOpen
          ? dom.uploadLayer
          : detailOpen
            ? dom.detailLayer
            : null;
    if (!layer) return;

    const focusable = getFocusable(layer);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

/* ---------------------------------------------------------
   17. Rendering / boot
   --------------------------------------------------------- */

function renderArchive() {
  buildGrid();
  renderGallery();
  updateStats();
}

async function init() {
  setupHeader();
  setupMenu();
  setupFilters();
  setupReflectiveCard();
  setupFlipCard();
  setupDetail();
  setupGlideSelects();
  setupUpload();
  setupFooterActions();
  setupAuth();
  setupAdmin();
  setupSling();
  setupGlobalKeys();
  setupSparkCanvas();
  setupStats();
  setupReveals();

  renderArchive();
  finishIntro();
  setupGridMotion();

  const uploadsReady = loadUploads();
  const apiReady = state.apiBase
    ? connectApiWithRetry()
        .then(async available => {
          state.authAvailable = available;
          if (!available) {
            updateAuthUI();
            return false;
          }
          await restoreSession();
          const loaded = await loadServerQuests();
          if (loaded) console.info('杭电支线：已连接 FastAPI 共享档案');
          return loaded;
        })
        .catch(error => {
          console.warn('FastAPI unavailable, using local archive:', error);
          state.authAvailable = false;
          updateAuthUI();
          return false;
        })
    : Promise.resolve(false);

  Promise.allSettled([uploadsReady, apiReady]).then(() => {
    if (!state.serverMode) document.body.dataset.dataMode = 'local';
    renderArchive();
    window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const questId = params.get('quest');
      if (questId && findQuest(questId) && !state.hidden.has(questId)) {
        openDetail(questId);
      } else if (questId) {
        setQuestParam(null);
      }
    }, 350);
  });
}

init().catch(error => {
  console.error('Archive boot failed:', error);
  finishIntro();
  showToast('档案加载遇到一点问题，请刷新重试');
});
