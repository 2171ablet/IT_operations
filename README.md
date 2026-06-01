# ITOps 智能自动化平台 v2

多 Agent 运维自动化平台，集成 Grafana 网络设备监控。

## 架构

```
┌─────────────────────────────────────────────────────┐
│                   ITOps 平台 (19.18)                  │
│  React SPA (Nginx:8080) + Node.js (3001) + SQLite    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ 仪表盘    │  │ 监控大屏  │  │ 网络设备 → Grafana │  │
│  │ 服务器管理 │  │ 报告系统  │  │ (iframe 嵌入)     │  │
│  │ Agent管理 │  │ 工作流   │  │                   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ iframe
┌──────────────────────▼──────────────────────────────┐
│              Grafana (19.17:3000)                     │
│          SNMP 网络设备监控仪表盘                       │
│               │                                      │
│        Prometheus (19.17:9090)                       │
│               │                                      │
│        SNMP Exporter (19.17:9116)                    │
│               │                                      │
│    6台网络设备 (核心交换机/防火墙/行为管理等)           │
└─────────────────────────────────────────────────────┘
```

## 服务器

| IP | 角色 | 服务 |
|----|------|------|
| 10.127.19.15 | 客户端 | Filebeat → 19.16 |
| 10.127.19.16 | 日志服务器 | Logstash + API + DeepSeek 代理 |
| 10.127.19.17 | SNMP 监控 | Prometheus + SNMP Exporter + sFlow-RT + Grafana |
| 10.127.19.18 | ITOps 平台 | Docker (前端+后端) |

## 功能

### 已实现
- 仪表盘：服务器/Agent/工作流概览
- 监控大屏：系统资源实时监控
- 服务器管理：SSH 远程管理 4 台服务器
- 网络设备：Grafana iframe 嵌入，SNMP 实时监控
- 报告系统：模板管理 + 生成 + 删除（自定义确认弹窗）
- Agent 管理：10 个运维 Agent
- 工作流：多 Agent 编排
- 告警中心：告警管理 + 自动处理 + 降噪
- 自动修复：策略 + 执行 + 回滚
- Web 终端：浏览器 SSH
- 知识库/脚本中心/定时任务/审计日志

### 定制化
- 去品牌化：删除所有 zjzwfw.cloud / ITOps Agent / 谭策 信息
- DeepSeek → AI分析 改名
- Canvas NaN 修复（监控大屏图表）
- 自定义删除确认弹窗（报告系统）

## 部署

### 前提
- CentOS 7.9 服务器
- Docker + Docker Compose
- 网络可访问阿里云容器镜像仓库（或使用本地镜像）

### 快速部署

```bash
# 1. 复制 docker-compose.yml 到服务器
scp docker-compose.yml root@10.127.19.18:/opt/

# 2. 启动服务
ssh root@10.127.19.18 "cd /opt && docker compose -f docker-compose.yml up -d"

# 3. 部署 Grafana（在 19.17 上）
scp install-grafana.sh root@10.127.19.17:/tmp/
ssh root@10.127.19.17 "bash /tmp/install-grafana.sh"
```

### Docker 镜像

使用本地定制镜像（推荐，修改不会丢失）：
```bash
# 构建定制镜像
docker commit smartauto-frontend itops-frontend:custom
docker commit smartauto-backend itops-backend:custom
```

docker-compose.yml 已配置使用本地镜像。

### 默认账号
- ITOps Web: admin / admin
- Grafana: admin / admin

## 文件结构

```
itops-platform-v2/
├── README.md                    # 本文件
├── docker-compose.yml           # Docker Compose 配置（使用本地镜像）
├── frontend/
│   └── index-v2.js              # 前端定制 JS（去品牌 + 修复 + 功能）
├── backend/
│   ├── package.json             # 后端配置（已去品牌）
│   ├── reportService.js         # 报告服务（含 deleteReport）
│   └── reportRoutes.js          # 报告路由（含 DELETE 端点）
├── scripts/
│   ├── install-grafana.sh       # Grafana 安装脚本
│   ├── setup-dashboard.sh       # Grafana 仪表盘配置
│   ├── deploy.sh                # 一键部署脚本
│   └── brand-fix.py             # 去品牌化脚本
├── nginx/
│   └── default.conf             # Nginx 配置
└── CHANGELOG.md                 # 变更记录
```

## 更新日志

### 2026-06-01
- 恢复完整去品牌化（前端 JS + 后端 pkg + nginx）
- 添加报告删除按钮（自定义确认弹窗）
- 修复监控大屏 Canvas createRadialGradient NaN 问题
- 部署 Grafana 9.5.21 + Prometheus 数据源
- 创建 SNMP 网络设备监控仪表盘（8 面板）
- 网络设备页面接入 Grafana iframe
- 制作本地 Docker 镜像（修改持久化）
