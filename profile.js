const API_TOKEN_KEY = 'hdu-sidequests.auth-token.v1';
const API_BASE_KEY = 'hdu-sidequests.api-base.v1';

const profileDom = {
  avatar: document.getElementById('profileAvatar'),
  name: document.getElementById('profileName'),
  role: document.getElementById('profileRole'),
  joined: document.getElementById('profileJoined'),
  email: document.getElementById('profileEmail'),
  selfBadge: document.getElementById('profileSelfBadge'),
  ownLink: document.getElementById('profileOwnLink'),
  statTotal: document.getElementById('statTotal'),
  statApproved: document.getElementById('statApproved'),
  statPending: document.getElementById('statPending'),
  statRatings: document.getElementById('statRatings'),
  statAverage: document.getElementById('statAverage'),
  count: document.getElementById('profileCount'),
  grid: document.getElementById('profileGrid'),
  empty: document.getElementById('profileEmpty'),
  title: document.getElementById('profileSubmissionsTitle'),
  state: document.getElementById('profileState'),
  stateText: document.getElementById('profileStateText'),
  stateBack: document.getElementById('profileStateBack')
};

function apiBase() {
  try {
    const override = new URLSearchParams(window.location.search).get('api')
      || window.HDU_API_BASE_URL
      || localStorage.getItem(API_BASE_KEY);
    if (override) return override.replace(/\/+$/, '');
  } catch (error) {
    /* ignore */
  }
  if (['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
    return 'http://127.0.0.1:8000/api';
  }
  return '';
}

function authToken() {
  try {
    return localStorage.getItem(API_TOKEN_KEY) || '';
  } catch (error) {
    return '';
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

function setAvatar(username) {
  profileDom.avatar.textContent = avatarInitial(username);
  profileDom.avatar.style.setProperty('--avatar-hue', String(avatarHue(username)));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function requestJSON(path, { auth = true, timeoutMs = 12000 } = {}) {
  const base = apiBase();
  if (!base) throw new Error('主页服务尚未连接，请先启动 FastAPI');
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const headers = {};
  const token = authToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  try {
    const response = await fetch(`${base}${path}`, { headers, signal: controller.signal });
    if (!response.ok) {
      let detail = `请求失败（${response.status}）`;
      try {
        const payload = await response.json();
        if (payload?.detail) detail = payload.detail;
      } catch (error) {
        /* ignore */
      }
      throw new Error(detail);
    }
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function setState(message, error = false) {
  profileDom.state.hidden = message === '';
  profileDom.state.classList.toggle('is-error', error);
  profileDom.stateText.textContent = message;
  profileDom.stateBack.hidden = !error;
}

function renderEmpty(message) {
  profileDom.empty.hidden = false;
  profileDom.empty.innerHTML = message;
  profileDom.grid.innerHTML = '';
}

function statusLabel(status) {
  if (status === 'pending') return '待审核';
  if (status === 'rejected') return '未通过';
  return '';
}

function renderCard(quest) {
  const status = statusLabel(quest.status);
  const score = typeof quest.score === 'number' ? quest.score.toFixed(1) : 'NEW';
  const statusMarkup = status
    ? `<span class="profile-card__status ${quest.status === 'rejected' ? 'is-rejected' : ''}">${status}</span>`
    : '';
  const motionMarkup = quest.has_motion
    ? '<span class="profile-card__motion">实况</span><span class="profile-card__play" aria-hidden="true">▶</span>'
    : '';
  return `<a class="profile-card" href="index.html?quest=${encodeURIComponent(quest.id)}">
    <div class="profile-card__media">
      <img src="${escapeHTML(quest.image)}" alt="${escapeHTML(quest.title)}" loading="lazy" decoding="async">
      <span class="profile-card__shade" aria-hidden="true"></span>
      ${statusMarkup}
      ${motionMarkup}
    </div>
    <div class="profile-card__body">
      <p class="profile-card__meta"><span>${escapeHTML(quest.category)}</span><span>${escapeHTML(quest.date)}</span></p>
      <h3>${escapeHTML(quest.title)}</h3>
      <div class="profile-card__foot"><span>${escapeHTML(quest.place)}</span><strong>★ ${score}</strong></div>
    </div>
  </a>`;
}

function renderProfile(profile, me) {
  setAvatar(profile.username);
  profileDom.name.textContent = profile.username;
  profileDom.role.textContent = profile.role === 'admin' ? '管理员' : '普通成员';
  profileDom.role.classList.toggle('is-admin', profile.role === 'admin');
  profileDom.joined.textContent = `加入于 ${formatDate(profile.created_at)}`;
  profileDom.email.hidden = !profile.email;
  profileDom.email.textContent = profile.email ? `邮箱 ${profile.email}` : '';
  profileDom.selfBadge.hidden = !profile.is_self;
  profileDom.title.textContent = profile.is_self ? '我的支线' : 'TA 的支线';
  profileDom.statTotal.textContent = String(profile.stats.total);
  profileDom.statApproved.textContent = String(profile.stats.approved);
  profileDom.statPending.textContent = String(profile.stats.pending);
  profileDom.statRatings.textContent = String(profile.stats.ratings_received);
  profileDom.statAverage.textContent = profile.stats.average_score == null
    ? '—'
    : profile.stats.average_score.toFixed(1);
  profileDom.count.textContent = `${profile.quests.length} 条`;
  profileDom.grid.innerHTML = profile.quests.map(renderCard).join('');

  if (!profile.quests.length) {
    renderEmpty(profile.is_self
      ? '你还没有投稿。回到档案<a href="index.html">分享一条杭电日常 ↗</a>'
      : 'TA 还没有公开的杭电日常。');
  } else {
    profileDom.empty.hidden = true;
  }

  if (me && me.username !== profile.username) {
    profileDom.ownLink.hidden = false;
    profileDom.ownLink.href = `profile.html?u=${encodeURIComponent(me.username)}`;
  } else {
    profileDom.ownLink.hidden = true;
  }

  document.title = `${profile.username} · 杭电支线`;
  setState('');
}

async function load() {
  const params = new URLSearchParams(window.location.search);
  let username = (params.get('u') || '').trim();
  const token = authToken();
  let me = null;

  if (token) {
    try {
      me = await requestJSON('/auth/me');
    } catch (error) {
      me = null;
    }
  }

  if (!username) {
    if (me) {
      window.location.replace(`profile.html?u=${encodeURIComponent(me.username)}`);
      return;
    }
    setState('这个主页缺少用户名。请从照片里的头像或账号菜单进入。', true);
    profileDom.grid.innerHTML = '';
    profileDom.empty.hidden = true;
    return;
  }

  try {
    setState('正在读取主页…');
    const profile = await requestJSON(`/users/${encodeURIComponent(username)}`);
    renderProfile(profile, me);
  } catch (error) {
    setState(error.message || '主页读取失败', true);
    profileDom.grid.innerHTML = '';
    profileDom.empty.hidden = true;
  }
}

load();
