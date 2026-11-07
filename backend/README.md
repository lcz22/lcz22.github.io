# 杭电支线 · FastAPI 后端

「杭电支线」的 FastAPI 后端。前端通过 HTTP API 访问数据，不会直接连接数据库。

当前默认用 SQLite 跑通完整闭环；拿到 PostgreSQL / MySQL 后，只需要修改 `DATABASE_URL`，API、前端调用方式和图片上传流程都不需要改。

## 目录结构

```text
backend/
├─ app/
│  ├─ config.py                 # 环境变量、JWT、分类、上传限制
│  ├─ db.py                     # async SQLAlchemy engine / session
│  ├─ models.py                 # users / quests / ratings
│  ├─ schemas.py                # Pydantic 请求 / 响应结构
│  ├─ security.py               # scrypt 密码哈希、JWT、权限依赖
│  ├─ auth.py                   # 注册 / 登录 / 当前用户
│  ├─ admin.py                  # 管理员用户管理与投稿审核
│  ├─ serializers.py            # QuestOut 序列化
│  ├─ storage.py                # 图片存储抽象 + 本地实现
│  ├─ routes.py                 # 公开支线 / 评分 / 投稿接口
│  ├─ main.py                   # FastAPI 入口
│  ├─ init_db.py                # 手动建表
│  ├─ seed.py                   # 导入 16 条预设杭电日常
│  ├─ create_admin.py           # 创建第一个管理员
│  └─ repositories/
│     ├─ base.py                # QuestRepository
│     ├─ sqlalchemy_repo.py     # 支线 / 评分实现
│     └─ users.py               # 用户数据访问
├─ seed/presets.json            # 预设内容
├─ sql/schema.sql               # PostgreSQL 建表参考
├─ tests/test_api.py            # 登录、权限、审核、接口测试
├─ uploads/                     # 本地图片目录（不提交）
├─ requirements.txt
├─ .env.example
└─ start-backend.bat
```

## 启动

在 `backend` 目录执行：

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m app.seed
python -m app.create_admin admin admin@example.com "你的管理员密码"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

也可以双击 `start-backend.bat` 启动服务，但第一次仍需手动执行 `python -m app.seed` 和 `python -m app.create_admin ...`。

启动后：

- API 根地址：<http://127.0.0.1:8000>
- Swagger 文档：<http://127.0.0.1:8000/docs>
- 健康检查：<http://127.0.0.1:8000/api/health>

`seed.py` 会从 `seed/presets.json` 读取内容，图片 URL 使用 `FRONTEND_BASE_URL` 拼接。已经存在的 ID 会跳过，重复执行不会插入重复数据。

## 用户与权限

角色只有两种：

| 角色 | 权限 |
| --- | --- |
| 游客 | 浏览已公开支线、查看详情和统计 |
| `user` 普通用户 | 游客权限 + 评分 + 投稿 + 删除自己的投稿 + 查看自己的待审/未通过内容 |
| `admin` 管理员 | 普通用户权限 + 查看用户 + 修改角色 / 启用停用 + 审核投稿 + 删除任意用户投稿 |

管理员不能取消自己的管理员身份，也不能停用自己；系统会保证至少保留一名可用管理员。

登录后请求头使用：

```http
Authorization: Bearer <access_token>
```

JWT 里包含用户 ID、用户名和角色，但每次请求仍会从数据库读取用户状态，因此管理员停用账号后会立即失效。

密码使用 Python 标准库的 **scrypt** 加盐哈希，数据库不保存明文密码。

### 审核流程

- 新投稿默认是 `pending`（`AUTO_APPROVE=false`）；
- 游客和普通用户看不到别人的待审内容；
- 作者可以在列表和详情里看到自己的待审 / 未通过内容；
- 管理员在「管理后台 → 投稿」里按 `pending / approved / rejected` 筛选；
- 通过后公开；拒绝时需要填写原因，作者能在详情里看到；
- 未通过审核的内容不能评分；
- 16 条预设内容不能被删除，只能在本机隐藏。

## 接口一览

### 认证

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/auth/config` | 是否开放注册 |
| POST | `/api/auth/register` | 注册并直接返回 token |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 获取当前用户 |

注册请求：

```json
{
  "username": "your_name",
  "email": "you@example.com",
  "password": "at-least-8-chars"
}
```

登录请求：

```json
{
  "identifier": "your_name 或 you@example.com",
  "password": "at-least-8-chars"
}
```

### 支线与评分

| 方法 | 路径 | 权限 |
| --- | --- | --- |
| GET | `/api/quests` | 公开，登录后包含自己的评分 |
| GET | `/api/quests/{id}` | 公开 |
| POST | `/api/quests` | 登录用户 |
| DELETE | `/api/quests/{id}` | 作者或管理员 |
| PUT | `/api/quests/{id}/rating` | 登录用户 |
| DELETE | `/api/quests/{id}/rating` | 登录用户 |
| GET | `/api/stats` | 公开 |
| GET | `/api/categories` | 公开 |

### 管理员

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/admin/users` | 用户列表 |
| PATCH | `/api/admin/users/{id}` | 修改角色 / 启用停用 |
| GET | `/api/admin/quests` | 全部投稿（含待审） |
| PATCH | `/api/admin/quests/{id}/status` | 公开 / 转为待审 |

管理员不能取消自己的管理员身份，也不能停用自己；系统会保证至少保留一名可用管理员。

## 创建第一个管理员

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m app.create_admin admin admin@example.com "a-strong-password"
```

如果用户名或邮箱已存在，会把该用户提升为管理员，并用命令里的新密码重置密码；否则会创建新账号。可以用同一命令修改管理员密码。

正式部署时不要把管理员密码写在命令行历史或代码里。

## 前端接入（已完成）

`app.js` 会自动探测 FastAPI：

- 本地访问 `http://127.0.0.1:4173/` 时，API 默认是 `http://127.0.0.1:8000/api`；
- 可以在 `index.html` 里修改 `window.HDU_API_BASE_URL`，或在 localStorage 设置 `hdu-sidequests.api-base.v1`；
- 后端不可用或数据库为空时，自动回退到 localStorage 模式；
- 登录后浏览器保存 JWT 到 localStorage，退出登录时清除；
- 评分、投稿、删除都走登录态；游客不能评分或投稿。

前端字段与 API 的对应关系：

| 前端字段 | API 字段 |
| --- | --- |
| `q.image` | `image` |
| `q.date` | `date`（`2026.11.02`） |
| `q.iso` | `iso` |
| `q.time` | `time` |
| `q.stamp` | `stamp` |
| `q.score` / `q.votes` | `score` / `votes` |
| `q.my_rating` | 当前登录用户自己的评分 |
| `q.is_user` | 是否为用户投稿 |
| `q.owner_username` | 投稿者用户名 |
| `q.is_owner` | 当前登录用户是否为作者 |
| `q.can_delete` | 当前登录用户能否删除 |
| `q.status` | `approved / pending / rejected` |
| `q.review_reason` | 未通过原因（作者和管理员可见） |
| `q.motion` | 实况视频 URL，没有则为 `null` |
| `q.has_motion` | 是否带实况视频 |

## 实况照片支持

后端支持两层：

1. **HEIC / HEIF 静态图**：使用 `pillow-heif` 解码，再统一转成 JPEG。iPhone 直接上传 `.heic` 也可以。
2. **实况动态**：`POST /api/quests` 额外接收可选的 `motion` 文件（MP4 / MOV，最多 60MB）。后端使用 ffmpeg 统一转码为浏览器兼容的 **H.264 MP4**，默认限制 15 秒、最长边 1280px。

ffmpeg 来源：

- 优先使用 `FFMPEG_BINARY` 指定的系统 ffmpeg；
- 否则使用 `PATH` 里的 `ffmpeg`；
- 都没有时使用 `imageio-ffmpeg` 包自带的二进制。

前端上传窗口里有「实况 / 动态」选择器。浏览器的文件选择器通常不能把 iPhone 实况照片的静态图和 MOV 自动配对，所以需要用户单独选择那段视频；不选就只保存静态画面。

`motion` 字段：

```http
Content-Type: multipart/form-data

image=@photo.jpg
motion=@live.mov
```

如果只上传静态图，`motion` 留空即可。

## 换成正式数据库

1. 复制配置：

```powershell
Copy-Item .env.example .env
```

2. 修改 `.env`：

```env
# PostgreSQL
DATABASE_URL=postgresql+asyncpg://用户名:密码@数据库地址:5432/数据库名
# 阿里云 RDS MySQL：
# DATABASE_URL=mysql+aiomysql://用户名:密码@数据库地址:3306/数据库名?charset=utf8mb4

PUBLIC_BASE_URL=https://你的API域名
FRONTEND_BASE_URL=https://lcz22.github.io
CORS_ORIGINS=https://lcz22.github.io,http://127.0.0.1:4173
JWT_SECRET=换成至少32位的随机字符串

# 实况视频转码参数
MOTION_MAX_SECONDS=15
MOTION_MAX_SIDE=1280
MOTION_CRF=24
# 可选：使用系统 ffmpeg
# FFMPEG_BINARY=/usr/bin/ffmpeg
```

`FRONTEND_BASE_URL` 用于种子数据的图片 URL；`PUBLIC_BASE_URL` 用于新上传图片的完整 URL。

3. 建表并导入种子：

```powershell
python -m app.init_db
python -m app.seed
python -m app.create_admin admin admin@example.com "a-strong-password"
```

也可以手动执行 [sql/schema.sql](sql/schema.sql)（PostgreSQL 版本）。MySQL 直接让 SQLAlchemy 建表。

> 生产环境不要把 5432 / 3306 暴露到公网。数据库只允许 ECS 内网 IP 访问。
> 表结构频繁变化时建议接入 Alembic，而不是长期依赖 `create_all`。

## 安全说明

- `JWT_SECRET` 默认值只适合本地开发，部署前必须更换；
- 密码最少 8 位，但正式站点建议加邮箱验证；
- 目前没有登录限流、验证码、邮件验证和 IP 频率限制，公开运营前需要补；
- 管理员审核状态已支持，默认 `AUTO_APPROVE=false`，新投稿先进入待审；
- 图片存储仍是本地 `uploads/`，正式运营建议换 OSS；
- 游客评分已关闭，所有评分都绑定登录用户；
- 实况视频会通过 ffmpeg 转成 H.264 MP4，最长 15 秒、最长边 1280px；如果需要更长或更清晰，调整 `MOTION_MAX_SECONDS`、`MOTION_MAX_SIDE`、`MOTION_CRF`。

## 测试

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest -q
```

测试使用临时 SQLite 数据库和临时上传目录，不会动到本地开发数据。覆盖：

- 注册 / 登录 / `/auth/me`；
- 游客禁止投稿、游客浏览；
- 作者评分、作者删除、其他用户禁止删除；
- 作者查看待审 / 未通过内容，游客看不到；
- 管理员查看用户、审核 / 拒绝投稿、删除他人投稿、防止最后一个管理员自降级；
- HEIC 静态图转换、MP4 / MOV 实况视频上传、ffmpeg 转码与删除清理。
