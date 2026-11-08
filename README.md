# 杭电支线 · HDU SIDE QUESTS

一个属于杭电学生的日常影像档案。照片在背景中缓慢漂移，点击任意一张，会回到某个普通的上学日：时间、地点、当下的感受，以及路过的人留下的评分。

愿景是让杭电学生分享各自的校园生活：早八前的教学楼、图书馆闭馆前、食堂里的一碗面、球场关灯之前，以及下沙的晚风和周末的杭州。

![杭电支线首页](assets/preview-home.jpg)

![单图详情](assets/preview-detail.jpg)

![上传页面](assets/preview-upload.jpg)

> 这是一个**非官方学生项目**，与杭州电子科技大学官方无关。

## 本地与线上预览

线上地址：**https://lcz22.github.io/**

当前本地预览地址：

**http://127.0.0.1:4173/**

也可以双击 `start-preview.bat` 自动启动本地服务器并打开浏览器。如果端口被占用，关闭旧的命令行窗口后重试。

### 本地完整联调

1. 启动后端（第一次需安装依赖）：

```powershell
cd backend
.\start-backend.bat
```

2. 第一次启动后，在另一个终端把 16 条预设内容写入 SQLite，并创建管理员：

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m app.seed
python -m app.create_admin admin admin@example.com "你的管理员密码"
```

3. 启动前端：

```powershell
.\start-preview.bat
```

前端访问 `http://127.0.0.1:4173/` 会自动检测 `http://127.0.0.1:8000/api`。后端不可用时会自动回退到本地模式。

## 已实现的功能

- **账号系统**：邮箱 + 用户名 + 密码注册登录，JWT 会话；游客可以浏览，登录后可以评分、投稿和删除自己的投稿。
- **用户主页**：登录后从账号菜单进入「我的主页」，查看自己的全部投稿（含待审核、未通过）；照片详情的右下角有投稿人头像，点击可进入对方主页。16 条预设内容归属于「杭电档案」账号，也有对应主页。
- **权限管理**：普通用户 / 管理员两种角色；管理员可以查看用户、修改角色、停用账号、审核投稿、删除任意投稿。
- **停用账号隔离**：被停用用户的投稿不会出现在主页背景、索引和公开详情中；管理员仍能在管理后台看到并处理。
- **内容审核**：新投稿默认进入待审核；作者能看到自己的待审 / 未通过内容和原因，游客只能看到已公开内容；管理员按待审 / 已公开 / 未通过筛选并填写拒绝原因。
- **多图图集**：一次最多选择 9 张照片；上传时层叠预览，详情中用 Stack 图层切换照片。图集审核通过后，索引页和主页背景会拆开为单张图片展示。
- **照片与实况合并上传**：照片和 MP4 / MOV 实况共用一个上传入口；每张照片单独识别与解码，HEIC 交给服务端转换，实况和静态图可以同时展示。
- **原比例展示**：详情照片框根据每张图片的原始宽高比自适应，竖图 / 横图 / 方图都不拉伸；切换到图集里的另一张图时，相框比例会跟着平滑变化。
- **手机端轻量加载**：首页背景、索引卡片和主页卡片在手机端优先使用 640px 缩略图，点击后才加载原图；索引首屏只渲染 12 张，底部「继续往下看」按需追加。
- **翻转卡片**：照片详情采用翻转卡；电脑端正面图片、背面故事与评分；手机端正面图片、背面评分，故事、详情和拍摄时间放在图片下方，翻转提示改为自动淡出的透明气泡。
- **主页剪刀删除**：用户在自己的主页点击投稿图片后，会打开预览并在右下角出现剪刀入口；按住图片拖动时图片缩小跟随指针，松手落在剪刀上才播放碎纸机动效并调用 FastAPI 删除。
- **审核预览**：管理员在后台点「查看」可以打开大图预览，查看图集全部图片、完整感受和实况视频。
- **实况照片**：支持 HEIC / HEIF 静态图；上传时可附带一段 MP4 / MOV 实况视频，服务端用 ffmpeg 转码为 H.264 MP4，详情页提供「实况」播放按钮。
- **Grid Motion 背景**：4 行斜向照片墙持续漂移，背景只展示站内评分较高且状态正常的照片；鼠标移动会带来轻微视差与逐张照片的点亮效果。
- **单图详情**：日期、时间、地点、感受与分类注脚；照片框支持图集叠层和翻转，评分位于翻转卡背面。
- **Reflective Card 图片卡**：照片嵌在一张会随鼠标轻微倾斜的金属相片卡中，边缘有拉丝金属、移动高光与反光层。
- **Peek Rating 评分**：鼠标悬停时星星会上浮、放大并显示评分标签，点击提交；再次点击同一颗星可收回评分。支持键盘方向键与屏幕阅读器。
- **Sling Button 上传入口**：首页右下角的圆形按钮可以点击，也可以向外拖拽后松开发射；打开上传窗口。
- **照片上传**：支持 JPG / PNG / WEBP / GIF / AVIF / BMP / HEIC，拖拽或点击选择，单张最大 20MB，一次最多 9 张；同一个入口也可以附带 1 段 MP4 / MOV 实况。JPG 优先在浏览器压缩；浏览器无法解码或画布失败时，自动改为上传原图由服务端压缩。HEIC 由后端转换。
- **Glide Select 选择器**：图片类目使用滑动的 Glide Select；拍摄日期拆成年 / 月 / 日三个联动的 Glide Select，切换月份时会自动校正天数，菜单带高亮滑轨、方向键操作和视口边缘翻转。
- **杭电分类**：校园 / 下沙 / 杭州 / 相遇 / 深夜，支持筛选、空状态与恢复隐藏内容。
- **辅助动效**：标题 BlurText 入场、卡片 3D 倾斜、点击火花（ClickSpark）、滚动揭示、数字递增、斜向 Marquee。
- **响应式**：桌面、平板与手机布局；支持 `prefers-reduced-motion`。

## 交互提示

| 操作 | 效果 |
| --- | --- |
| 点击背景任何照片 | 打开对应杭电日常 |
| 点击索引卡片 | 打开对应杭电日常 |
| 点击右上角「登录 / 注册」 | 打开账号窗口 |
| 登录后点击右上角头像 | 打开账号菜单 / 管理后台 |
| 点击星星 | 未登录时先登录；登录后提交评分 |
| 拖拽 / 点击右下圆形按钮 | 登录后打开投稿窗口 |
| 在详情页拖拽星星 | 预览分数并显示标签 |
| 点击星星 / 再点一次 | 提交评分 / 收回评分 |
| 点击图片 | 翻到详情背面 / 返回照片 |
| 图集：点击左右箭头 / `←` `→` | 切换图集中的照片 |
| 类目或日期选择器：`↑` `↓` `Home` `End` | 在高亮行间移动 |
| 类目或日期选择器：`Enter` / `Space` | 确认选择 |
| 在自己的主页点击投稿图片 | 打开预览并出现右下角剪刀入口 |
| 按住预览图片拖到剪刀上松手 | 播放碎纸动效并删除投稿 |
| 管理员后台点「查看」 | 打开图集 / 大图 / 完整感受预览 |
| `Esc` | 关闭弹层 |
| 拖拽照片到上传框 | 选择一张或多张照片 |

## 数据存储与「共享」说明

当前是双模式：

- **本地 FastAPI 可用时**：列表、评分、上传、删除走 FastAPI + SQLite，所有访问 `127.0.0.1:4173` 的浏览器共享同一份数据。
- **FastAPI 不可用时**：自动回退到原来的 localStorage / IndexedDB 模式，GitHub Pages 线上页面仍然可以使用。
- **被隐藏的预设支线**：仍保存在本地 `localStorage`（隐藏只是当前浏览器的个人视图）。
- **登录身份**：登录后 JWT 保存在本地 `localStorage`，退出登录时清除；评分和投稿都绑定账号。
- **管理员**：通过 `python -m app.create_admin` 创建，拥有用户管理和审核权限。
- **待审核内容**：默认只有作者和管理员可见，通过审核后才进入公共档案。

本地联调时，启动 FastAPI 后可以和其他浏览器/设备共享同一份 SQLite 数据。正式上线换成 PostgreSQL / MySQL 后，才会成为真正校园范围的共享档案。

## FastAPI 后端（已联调）

完整后端代码在 [`backend/`](backend/README.md)，目前用 SQLite 跑通接口，数据库地址可随时替换为 PostgreSQL / MySQL：

```text
前端 GitHub Pages / OSS
        ↓ HTTPS
FastAPI（ECS / 阿里云）
        ↓
PostgreSQL（RDS 或 ECS 自建）
        ↓
OSS（照片）
```

已包含：

- 注册 / 登录 / 当前用户：`/api/auth/*`；
- `GET /api/quests`、`GET /api/quests/{id}`：列表与详情；
- `POST /api/quests`：登录后 multipart 上传照片并创建支线；
- `PUT /api/quests/{id}/rating`：登录后提交 / 修改评分；
- `DELETE /api/quests/{id}/rating`：收回评分；
- `DELETE /api/quests/{id}`：作者或管理员删除投稿；
- `GET /api/admin/users`、`PATCH /api/admin/users/{id}`：管理员用户与角色管理；
- `GET /api/admin/quests`、`PATCH /api/admin/quests/{id}/status`：管理员审核、拒绝原因和筛选；
- `GET /api/users/{username}`：用户主页、公开投稿和个人统计；
- `GET /api/stats`、`GET /api/categories`、`GET /api/health`；
- Swagger 文档：`http://127.0.0.1:8000/docs`。

数据库访问已抽象成 `QuestRepository` 和 `UserRepository`，当前实现是 SQLAlchemy；后续拿到 PostgreSQL 后只需修改 `backend/.env` 的 `DATABASE_URL`，然后执行 `python -m app.init_db`。

前端已接入 API：本地打开 `http://127.0.0.1:4173/` 会自动探测 `http://127.0.0.1:8000/api`；如果后端不可用，会自动回退到 localStorage 模式。第一次启动后端时需要执行：

```powershell
cd backend
python -m app.seed
python -m app.create_admin admin admin@example.com "你的管理员密码"
```

`seed` 会把 16 条预设杭电日常写入 SQLite，页面就能从 API 读取统一的初始内容。`create_admin` 用来创建第一个管理员，之后可以在页面里的「管理后台」继续管理用户。

## 文件结构

```
网页设计/
├─ index.html               页面结构
├─ styles.css               视觉、动效与响应式
├─ app.js                   数据、背景、评分、上传、删除、路由
├─ profile.html             用户主页
├─ profile.css              用户主页样式
├─ profile.js               用户主页数据与渲染
├─ start-preview.bat        一键启动本地预览
├─ preview-server.mjs       Node 备用静态服务器
├─ backend/                 FastAPI 后端（认证、权限、数据库抽象）
│  ├─ app/auth.py           登录 / 注册
│  ├─ app/admin.py          管理员接口
│  ├─ app/security.py       JWT / 密码哈希
│  └─ seed/presets.json     16 条预设数据
├─ README.md
└─ assets/
   ├─ favicon.svg
   ├─ preview-home.jpg
   ├─ preview-detail.jpg
   ├─ preview-upload.jpg
   ├─ fonts/
   │  └─ noto-serif-sc-subset.woff2
   └─ photos/               16 张杭电日常预设照片
```

## 修改内容

- 预设故事在 `app.js` 顶部的 `PRESETS` 数组中。每条记录包含标题、日期、地点、分类、感受、图片路径和初始评分。
- 分类与分类注脚在 `app.js` 的 `CATEGORIES`、`CATEGORY_NOTES` 中；筛选按钮需要同步修改 `index.html`。
- 色彩、字体、间距在 `styles.css` 顶部 `:root` 中统一控制；目前使用杭电蓝 `#4d7cff`。
- 如需替换照片，把图片放进 `assets/photos/`，再修改对应 `image` 路径。
- 用户主页通过 `profile.html?u=用户名` 访问；头像目前由用户名生成渐变圆形头像，后续可以扩展为头像上传。
- 上传照片会经过 `compressImage()` 处理，默认最长边 1800px、JPEG 质量 0.84。

## 制作参考

- 背景图片网格动效参考 [React Bits — Grid Motion](https://www.reactbits.dev/backgrounds/grid-motion)
- 详情图片卡片参考 [React Bits — Reflective Card](https://www.reactbits.dev/components/reflective-card)
- 长按删除按钮参考 [React Bits — Hold Button](https://www.reactbits.dev/micro/hold-button)（详情页已改为主页粉碎删除）
- 图集叠层与翻转卡分别参考 React Bits 的 Stack 和 Flip Card 交互思路
- 主页粉碎动效参考 React Bits 的 Shredder 交互思路
- 星星评分参考 [React Bits — Peek Rating](https://www.reactbits.dev/micro/peek-rating)
- 上传按钮参考 [React Bits — Sling Button](https://www.reactbits.dev/micro/sling-button)
- 类目与日期选择参考 [React Bits — Glide Select](https://www.reactbits.dev/micro/glide-select)
- 额外动效参考 React Bits 的 BlurText、TiltedCard、ClickSpark、AnimatedContent、CountUp、Marquee 等交互思路

所有动效均以原生 HTML / CSS / JavaScript 重写，无 React 或第三方运行依赖。

## 照片版权

预设照片来自 Unsplash，仅用于本作品的照片占位与课程演示。若正式面向杭电学生公开运营，建议替换为已获授权的杭电校园实拍照片，并保留摄影者署名。
