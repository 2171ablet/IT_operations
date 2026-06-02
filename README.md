# IT Operations 智能运维平台 v3

多 Agent 运维自动化平台，集成 Grafana 网络设备监控，一键安装部署。

## 一键安装

```bash
git clone https://github.com/2171ablet/IT_operations.git
cd IT_operations
bash scripts/install.sh
```

安装完成后访问：
- 运维平台: http://服务器IP:8080
- Grafana: http://服务器IP:3000

## 架构

```
IT Operations Platform (Docker)
├── React SPA (Nginx:8080)
├── Node.js API (3001) + SQLite
├── 仪表盘 / 监控大屏 / 服务器管理
├── 网络设备 → Grafana iframe
├── Agent 管理 / 工作流 / 任务执行
├── 告警中心 / 自动修复 / 根因分析
├── 报告系统 / 知识库 / 脚本中心
└── Web 终端 / 审计日志

Grafana 网络设备监控 (独立部署)
├── SNMP 仪表盘 (Prometheus 数据源)
├── 接口状态 / 流量 / CPU / 内存
└── iframe 嵌入运维平台
```

## 服务器要求

| 服务器 | 角色 | 配置 |
|--------|------|------|
| 主服务器 | ITOps 平台 (Docker) | CentOS 7.9, Docker, 4GB+ RAM |
| 监控服务器 | Grafana + Prometheus | CentOS 7.9, 4GB+ RAM |

## 功能

- 仪表盘：服务器/Agent/工作流概览
- 监控大屏：系统资源实时监控（CPU/内存/网络/磁盘图表）
- 服务器管理：SSH 远程管理
- 网络设备：Grafana iframe 嵌入，SNMP 实时监控
- 报告系统：模板管理 + 生成 + 删除（确认弹窗）
- Agent 管理：多 Agent 编排
- 工作流：可视化工作流引擎
- 告警中心：告警管理 + 自动处理 + 降噪
- 自动修复：策略 + 执行 + 回滚
- Web 终端：浏览器 SSH
- 知识库 / 脚本中心 / 定时任务 / 审计日志

## 文件结构

```
IT_operations/
├── README.md
├── docker-compose.yml
├── scripts/
│   ├── install.sh            # 一键安装
│   ├── install-grafana.sh    # Grafana 安装
│   └── brand-fix.py          # 品牌定制工具
├── frontend/
│   └── index-v2.js           # 前端定制
├── backend/
│   ├── package.json
│   ├── reportService.js
│   └── reportRoutes.js
└── nginx/
    └── default.conf
```

## 默认账号

首次登录后请修改密码：
- 运维平台: admin / admin
- Grafana: admin / admin
