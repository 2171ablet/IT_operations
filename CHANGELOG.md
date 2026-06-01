# 变更记录

## 2026-06-01

### 去品牌化
- 前端 JS：删除 zjzwfw.cloud / ITOps Agent / DeepSeek / 谭策 所有引用
- 后端 package.json：清空 homepage / author，description 改为"运维智能自动化平台"
- Nginx 配置注释：ITOps Agent Platform → 运维智能自动化平台
- 旧文件 index-BZzpEvbl.js 已删除

### 报告系统
- 后端添加 deleteReport 方法（reportService.js）
- 后端添加 DELETE /api/reports/:id 路由（reportRoutes.js）
- 前端添加删除按钮（自定义确认弹窗，状态 [q,B]=M.useState(null)）

### 监控大屏
- 修复 Canvas createRadialGradient NaN 错误（isNaN 保护）

### Grafana 网络监控
- 在 10.127.19.17 安装 Grafana 9.5.21
- 配置 Prometheus 数据源（localhost:9090）
- 创建 SNMP 网络设备监控仪表盘（snmp-network-monitor）
- 8 个面板：在线设备/接口状态/流量/CPU/内存
- ITOps 网络设备页面通过 iframe 嵌入 Grafana（kiosk 模式）
- 防火墙开放端口 3000

### Docker 镜像持久化
- docker commit → itops-frontend:custom / itops-backend:custom
- docker-compose.yml 使用本地镜像，重建不丢失修改
