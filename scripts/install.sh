#!/bin/bash
# IT Operations 智能运维平台 v3 - 一键安装脚本
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo "========================================"
echo " IT Operations 智能运维平台 v3 安装"
echo "========================================"
echo ""

# ── 配置 ──
ITOP_HOST="${1:-192.168.1.18}"
GRAFANA_HOST="${2:-192.168.1.17}"
ITOP_PASS="${3:-China@123}"
GRAFANA_PASS="${4:-Tongwei@123}"

log "目标服务器: ITOps=$ITOP_HOST  Grafana=$GRAFANA_HOST"

# ── 1. 检查依赖 ──
log "检查环境..."
command -v docker &>/dev/null || err "请先安装 Docker"
command -v ssh &>/dev/null || err "请先安装 SSH 客户端"
command -v scp &>/dev/null || err "请先安装 SCP"

# ── 2. 部署 ITOps ──
log "部署 ITOps 平台到 $ITOP_HOST ..."

scp docker-compose.yml root@${ITOP_HOST}:/opt/itops-docker-compose.yml
scp frontend/index-v2.js root@${ITOP_HOST}:/tmp/v2_clean.js
scp backend/reportService.js backend/reportRoutes.js backend/package.json root@${ITOP_HOST}:/tmp/
scp nginx/default.conf root@${ITOP_HOST}:/tmp/

ssh root@${ITOP_HOST} bash << 'DEPLOY'
set -e
cd /opt

# 启动容器
docker compose -f itops-docker-compose.yml up -d
echo "等待服务启动..."
sleep 20

# 部署前端
docker cp /tmp/v2_clean.js smartauto-frontend:/usr/share/nginx/html/assets/index-v2.js
TS=$(date +%s)
docker exec smartauto-frontend sh -c "sed -i 's/index-v2.js?v=[0-9]*/index-v2.js?v=${TS}/g' /usr/share/nginx/html/index.html"

# 部署后端
docker cp /tmp/reportService.js smartauto-backend:/app/dist/services/reportService.js
docker cp /tmp/reportRoutes.js smartauto-backend:/app/dist/routes/reportRoutes.js
docker cp /tmp/package.json smartauto-backend:/app/package.json

# 部署 Nginx
docker cp /tmp/default.conf smartauto-frontend:/etc/nginx/conf.d/default.conf

# 重载
docker exec smartauto-frontend nginx -s reload 2>/dev/null || true
docker restart smartauto-backend

# 提交定制镜像
sleep 10
docker commit smartauto-frontend itops-frontend:custom 2>/dev/null || true
docker commit smartauto-backend itops-backend:custom 2>/dev/null || true

# 验证
sleep 5
curl -sf http://localhost:8080/ > /dev/null && echo "ITOps: OK" || echo "ITOps: 异常"
curl -sf http://localhost:3001/health > /dev/null && echo "API: OK" || echo "API: 异常"
DEPLOY

log "ITOps 部署完成 → http://${ITOP_HOST}:8080"

# ── 3. 部署 Grafana ──
log "部署 Grafana 到 $GRAFANA_HOST ..."
scp scripts/install-grafana.sh root@${GRAFANA_HOST}:/tmp/
ssh root@${GRAFANA_HOST} "bash /tmp/install-grafana.sh"

log "Grafana 部署完成 → http://${GRAFANA_HOST}:3000"

# ── 4. 完成 ──
echo ""
echo "========================================"
echo " 安装完成!"
echo "========================================"
echo " 运维平台: http://${ITOP_HOST}:8080"
echo " 账号密码: admin / admin"
echo ""
echo " Grafana:  http://${GRAFANA_HOST}:3000"
echo " 账号密码: admin / admin"
echo "========================================"
