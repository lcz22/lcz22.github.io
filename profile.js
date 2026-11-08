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
  lightbox: document.getElementById('profileLightbox'),
  lightboxFrame: document.getElementById('lightboxFrame'),
  lightboxImage: document.getElementById('lightboxImage'),
  lightboxTitle: document.getElementById('lightboxTitle'),
  lightboxClose: document.getElementById('lightboxClose'),
  lightboxDetail: document.getElementById('lightboxDetail'),
  lightboxScissors: document.getElementById('lightboxScissors'),
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

let toastTimer = 0;
function showToast(message) {
  window.clearTimeout(toastTimer);
  setState(message);
  toastTimer = window.setTimeout(() => setState(''), 3000);
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

function renderCard(quest, canDelete) {
  const status = statusLabel(quest.status);
  const score = typeof quest.score === 'number' ? quest.score.toFixed(1) : 'NEW';
  const statusMarkup = status
    ? `<span class="profile-card__status ${quest.status === 'rejected' ? 'is-rejected' : ''}">${status}</span>`
    : '';
  const motionMarkup = quest.has_motion
    ? '<span class="profile-card__motion">实况</span><span class="profile-card__play" aria-hidden="true">▶</span>'
    : quest.image_count > 1
      ? `<span class="profile-card__motion">图集 ${quest.image_count}</span>`
      : '';
  return `<a class="profile-card" href="index.html?quest=${encodeURIComponent(quest.id)}"
    data-quest-id="${escapeHTML(quest.id)}" draggable="false">
    <div class="profile-card__media">
      <img src="${escapeHTML(quest.image)}" alt="${escapeHTML(quest.title)}" loading="lazy" decoding="async" draggable="false">
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
  currentProfile = profile;
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
  profileDom.grid.innerHTML = profile.quests.map(quest => renderCard(quest, profile.is_self)).join('');

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

async function deleteQuest(questId) {
  const base = apiBase();
  const token = authToken();
  if (!base) throw new Error('主页服务尚未连接');
  const response = await fetch(`${base}/quests/${encodeURIComponent(questId)}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    let detail = `删除失败（${response.status}）`;
    try {
      const payload = await response.json();
      if (payload?.detail) detail = payload.detail;
    } catch (error) {
      /* ignore */
    }
    throw new Error(detail);
  }
}

function shredImage(image) {
  const rect = image.getBoundingClientRect();
  const strips = 12;
  const stripWidth = rect.width / strips;
  const layer = document.createElement('div');
  layer.className = 'shred-layer';
  layer.setAttribute('aria-hidden', 'true');

  for (let index = 0; index < strips; index += 1) {
    const strip = document.createElement('span');
    strip.className = 'shred-strip';
    strip.style.left = `${rect.left + index * stripWidth}px`;
    strip.style.top = `${rect.top}px`;
    strip.style.width = `${stripWidth + 1}px`;
    strip.style.height = `${rect.height}px`;
    strip.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
    strip.style.backgroundSize = `${rect.width}px ${rect.height}px`;
    strip.style.backgroundPosition = `${-index * stripWidth}px 0`;
    strip.style.setProperty('--shred-x', `${(Math.random() - 0.5) * 150}px`);
    strip.style.setProperty('--shred-rot', `${(Math.random() - 0.5) * 55}deg`);
    strip.style.animationDelay = `${Math.random() * 0.12}s`;
    layer.append(strip);
  }

  document.body.append(layer);
  window.setTimeout(() => layer.remove(), 1400);
}

let currentProfile = null;
let currentLightboxQuest = null;
let lightboxDrag = null;

function openLightbox(questId) {
  const quest = currentProfile?.quests.find(item => item.id === questId);
  if (!quest) return;
  currentLightboxQuest = quest;
  profileDom.lightboxTitle.textContent = quest.title;
  profileDom.lightboxImage.src = quest.image;
  profileDom.lightboxImage.alt = quest.title;
  profileDom.lightboxDetail.href = `index.html?quest=${encodeURIComponent(quest.id)}`;
  profileDom.lightbox.hidden = false;
  profileDom.lightboxScissors.classList.remove('is-over', 'is-fired');
}

function closeLightbox() {
  if (lightboxDrag) {
    lightboxDrag.clone?.remove();
    lightboxDrag.float?.remove();
    lightboxDrag.image.style.opacity = '';
    lightboxDrag = null;
  }
  removeLightboxDragListeners();
  profileDom.lightbox.hidden = true;
  currentLightboxQuest = null;
}

function removeLightboxDragListeners() {
  document.removeEventListener('pointermove', onLightboxPointerMove);
  document.removeEventListener('pointerup', onLightboxPointerUp);
  document.removeEventListener('pointercancel', onLightboxPointerCancel);
}

function onLightboxPointerMove(event) {
  if (!lightboxDrag) return;
  const { clone, float, startX, startY, rect } = lightboxDrag;
  clone.style.left = `${rect.left + event.clientX - startX}px`;
  clone.style.top = `${rect.top + event.clientY - startY}px`;
  const over = document.elementFromPoint(event.clientX, event.clientY)
    ?.closest('#lightboxScissors, .scissors-float');
  profileDom.lightboxScissors.classList.toggle('is-over', Boolean(over));
  float?.classList.toggle('is-over', Boolean(over));
}

function finishLightboxDrag(drop) {
  if (!lightboxDrag) return;
  const drag = lightboxDrag;
  lightboxDrag = null;
  removeLightboxDragListeners();
  drag.float?.remove();
  profileDom.lightboxScissors.classList.remove('is-over');
  if (drop) {
    profileDom.lightboxScissors.classList.add('is-fired');
    drag.clone.remove();
    deleteLightboxQuest(drag.quest, drag.image);
    return;
  }
  drag.clone.style.transition = 'left 0.28s ease, top 0.28s ease, transform 0.28s ease, opacity 0.28s ease';
  drag.clone.style.left = `${drag.rect.left}px`;
  drag.clone.style.top = `${drag.rect.top}px`;
  drag.clone.style.transform = 'scale(1)';
  drag.clone.style.opacity = '1';
  window.setTimeout(() => {
    drag.clone.remove();
    drag.image.style.opacity = '';
  }, 300);
}

function onLightboxPointerUp(event) {
  if (!lightboxDrag) return;
  const over = document.elementFromPoint(event.clientX, event.clientY)
    ?.closest('#lightboxScissors, .scissors-float');
  finishLightboxDrag(Boolean(over));
}

function onLightboxPointerCancel() {
  finishLightboxDrag(false);
}

function startLightboxDrag(event) {
  if (!currentProfile?.is_self || !currentLightboxQuest || event.button !== 0) return;
  event.preventDefault();
  const image = profileDom.lightboxImage;
  const rect = image.getBoundingClientRect();
  const clone = image.cloneNode(true);
  clone.removeAttribute('id');
  clone.className = 'lightbox-drag';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.transform = 'scale(0.78)';
  document.body.append(clone);

  const scissorsRect = profileDom.lightboxScissors.getBoundingClientRect();
  const float = profileDom.lightboxScissors.cloneNode(true);
  float.removeAttribute('id');
  float.classList.add('scissors-float');
  float.style.left = `${scissorsRect.left}px`;
  float.style.top = `${scissorsRect.top}px`;
  float.style.right = 'auto';
  float.style.bottom = 'auto';
  float.style.width = `${scissorsRect.width}px`;
  float.style.height = `${scissorsRect.height}px`;
  document.body.append(float);

  image.style.opacity = '0.24';
  lightboxDrag = {
    clone,
    float,
    image,
    quest: currentLightboxQuest,
    rect,
    startX: event.clientX,
    startY: event.clientY
  };
  document.addEventListener('pointermove', onLightboxPointerMove);
  document.addEventListener('pointerup', onLightboxPointerUp, { once: true });
  document.addEventListener('pointercancel', onLightboxPointerCancel, { once: true });
}

async function deleteLightboxQuest(quest, image) {
  shredImage(image);
  try {
    await deleteQuest(quest.id);
    closeLightbox();
    await load();
    showToast('投稿已粉碎并从档案删除');
  } catch (error) {
    image.style.opacity = '';
    showToast(error.message || '删除失败，请稍后再试');
  }
}

function setupLightbox() {
  profileDom.grid.addEventListener('click', event => {
    const card = event.target.closest('.profile-card');
    if (!card || !currentProfile?.is_self) return;
    event.preventDefault();
    openLightbox(card.dataset.questId);
  });

  profileDom.lightboxClose.addEventListener('click', closeLightbox);
  profileDom.lightboxScissors.addEventListener('click', event => event.preventDefault());
  document.querySelectorAll('[data-close-lightbox]').forEach(element => {
    element.addEventListener('click', closeLightbox);
  });
  profileDom.lightboxImage.addEventListener('pointerdown', startLightboxDrag);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !profileDom.lightbox.hidden) closeLightbox();
});

setupLightbox();
load();
