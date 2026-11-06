# 杭电支线 · FastAPI 后端

这个目录是「杭电支线」的后端骨架。前端只通过 HTTP API 访问数据，**不会直接连接数据库**。

当前默认用 SQLite 跑通接口；你后续拿到 PostgreSQL 后，只需要修改 `DATABASE_URL`，API、前端调用方式和图片上传流程都不需要改。

## 目录结构

```text
backend/
├─ app/
│  ├─ config.py                 # 环境变量、分类、上传限制
│  ├─ db.py                     # async SQLAlchemy engine / session
│  ├─ models.py                 # quests、ratings 表
│  ├─ schemas.py                # Pydantic 请求 / 响应结构
│  ├─ storage.py                # 图片存储抽象 + 本地实现（后续可换 OSS）
│  ├─ routes.py                 # REST API
│  ├─ main.py                   # FastAPI 入口
│  ├─ init_db.py                # 手动建表
│  └─ repositories/
│     ├─ base.py                # 数据库接口 QuestRepository
│     └─ sqlalchemy_repo.py     # SQLAlchemy 实现
├─ sql/schema.sql               # PostgreSQL 建表参考
├─ tests/test_api.py            # 接口测试
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
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

或者双击 `start-backend.bat`。

启动后：

- API 根地址：<http://127.0.0.1:8000>
- Swagger 文档：<http://127.0.0.1:8000/docs>
- 健康检查：<http://127.0.0.1:8000/api/health>

## 接口一览

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/categories` | 获取分类 |
| GET | `/api/stats` | 总条数、总评分、分类数量 |
| GET | `/api/quests` | 支线列表，支持 `category` / `limit` / `offset` |
| GET | `/api/quests/{id}` | 单条支线 |
| POST | `/api/quests` | multipart 上传照片并创建支线 |
| DELETE | `/api/quests/{id}` | 用 `X-Edit-Token` 删除自己的支线 |
| PUT | `/api/quests/{id}/rating` | 提交 / 修改自己的评分 |
| DELETE | `/api/quests/{id}/rating` | 收回自己的评分 |

所有需要“匿名访客身份”的评分接口，通过请求头传递：

```http
X-Visitor-Id: a-random-visitor-id
```

前端可以在浏览器首次访问时生成一个 UUID 并保存在 `localStorage`。

创建支线后，接口会返回一次性的 `manage_token`。删除时放在：

```http
X-Edit-Token: the-manage-token
```

数据库里只保存它的 SHA-256 哈希，不保存明文。

## 创建支线示例

```bash
curl -X POST http://127.0.0.1:8000/api/quests \
  -F "title=在图书馆躲雨" \
  -F "shot_date=2026-11-05" \
  -F "shot_time=16:05" \
  -F "place=杭电 · 图书馆" \
  -F "feeling=雨把窗户洗得很亮，我在书架之间站了很久。" \
  -F "category=校园" \
  -F "image=@./my-photo.jpg"
```

评分示例：

```bash
curl -X PUT http://127.0.0.1:8000/api/quests/<id>/rating \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Id: visitor-0001" \
  -d '{"score": 5}'
```

## 换成你提供的数据库

1. 复制配置：

```powershell
Copy-Item .env.example .env
```

2. 修改 `.env`：

```env
# PostgreSQL
DATABASE_URL=postgresql+asyncpg://用户名:密码@数据库地址:5432/数据库名
# 如果买的是阿里云 RDS MySQL，改用：
# DATABASE_URL=mysql+aiomysql://用户名:密码@数据库地址:3306/数据库名?charset=utf8mb4

PUBLIC_BASE_URL=https://你的API域名
CORS_ORIGINS=https://lcz22.github.io,http://127.0.0.1:4173
```

3. 建表：

```powershell
python -m app.init_db
```

也可以手动执行 [sql/schema.sql](sql/schema.sql)（该文件是 PostgreSQL 版本；MySQL 直接让 SQLAlchemy 建表即可）。

4. 如果数据库是 PostgreSQL，确认已安装 `asyncpg`；如果是 MySQL，确认已安装 `aiomysql`。两者都已在 `requirements.txt` 里。

> 生产环境不要把 5432 暴露到公网。数据库只允许 ECS 内网 IP 访问；后端和数据库最好在同一个 VPC。
> 后续如果表结构经常变化，建议接入 Alembic 做迁移，而不是长期依赖 `create_all`。

## 设计说明

### 数据库接口

`app/repositories/base.py` 定义了 `QuestRepository`，HTTP 层只依赖这个抽象。当前实现是 `SqlAlchemyQuestRepository`。

如果以后要换数据库或换数据访问方式，可以实现同一组方法：

- `list_quests`
- `get_quest`
- `create_quest`
- `delete_quest`
- `upsert_rating`
- `delete_rating`
- `stats`

然后在 `routes.py` 的 `get_repository` 里替换实现即可。

### 图片存储

`app/storage.py` 的 `ImageStorage` 抽象目前有 `LocalImageStorage`。以后接阿里云 OSS 时：

1. 新增 `OssImageStorage` 实现 `save` / `delete`；
2. 把 `get_storage()` 返回的对象换掉；
3. API 和前端不用改。

**不要把阿里云 AccessKey 写进前端**。正式接 OSS 时，应由后端生成签名或代理上传。

### 上传安全

- 只接受图片 MIME；
- 最大 20MB；
- 服务端使用 Pillow 重新编码为 JPEG，去除原始文件的不可控元数据；
- 最长边缩到 1800px；
- 本地文件名使用随机 UUID，避免路径穿越和重名。

### 审核状态

`quests.status` 已预留 `approved / pending`。当前 `AUTO_APPROVE=true`，新投稿直接公开；正式运营建议设为 `false`，并在后续增加管理员审核接口。

## 测试

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest -q
```

测试使用临时 SQLite 数据库和临时上传目录，不会动到本地开发数据。

## 前端接入时需要做的映射

当前前端字段与 API 基本对齐：

| 前端字段 | API 字段 |
| --- | --- |
| `q.image` | `image` |
| `q.date` | `date`（显示格式 `2026.11.02`） |
| `q.iso` | `iso` |
| `q.time` | `time` |
| `q.baseScore` / `baseVotes` | 不再需要，使用 `score` / `votes` |
| `q.isUser` | `is_user` |

评分提交时，前端还需生成并持久化一个 `visitor_id`，每次请求放在 `X-Visitor-Id` 请求头里。
