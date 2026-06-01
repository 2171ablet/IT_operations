#!/bin/bash
# ITOps 智能自动化平台 - 一键部署脚本
set -e

echo "=== ITOps 智能自动化平台 v2 部署 ==="

# 服务器配置
ITOP_HOST="10.127.19.18"
GRAFANA_HOST="10.127.19.17"
ITOP_PASS="China@123"
GRAFANA_PASS="Tongwei@123"

# 1. 部署 Docker 容器
echo ""
echo "--- 1. 部署 ITOps Docker 容器 ---"
scp docker-compose.yml root@${ITOP_HOST}:/opt/itops-docker-compose.yml
ssh root@${ITOP_HOST} "cd /opt && docker compose -f itops-docker-compose.yml down 2>/dev/null; docker compose -f itops-docker-compose.yml up -d"

# 2. 部署定制前端
echo ""
echo "--- 2. 部署定制前端文件 ---"
scp frontend/index-v2.js root@${ITOP_HOST}:/tmp/v2_clean.js
ssh root@${ITOP_HOST} "docker cp /tmp/v2_clean.js smartauto-frontend:/usr/share/nginx/html/assets/index-v2.js"
TIMESTAMP=$(date +%s)
ssh root@${ITOP_HOST} "docker exec smartauto-frontend sh -c "sed -i 's/index-v2.js?v=[0-9]*/index-v2.js?v=${TIMESTAMP}/g' /usr/share/nginx/html/index.html""
ssh root@${ITOP_HOST} "docker exec smartauto-frontend nginx -s reload"

# 3. 部署定制后端
echo ""
echo "--- 3. 部署定制后端文件 ---"
scp backend/reportService.js root@${ITOP_HOST}:/tmp/
scp backend/reportRoutes.js root@${ITOP_HOST}:/tmp/
scp backend/package.json root@${ITOP_HOST}:/tmp/
ssh root@${ITOP_HOST} "docker cp /tmp/reportService.js smartauto-backend:/app/dist/services/reportService.js"
ssh root@${ITOP_HOST} "docker cp /tmp/reportRoutes.js smartauto-backend:/app/dist/routes/reportRoutes.js"
ssh root@${ITOP_HOST} "docker cp /tmp/package.json smartauto-backend:/app/package.json"
ssh root@${ITOP_HOST} "docker restart smartauto-backend"

# 4. 提交定制镜像
echo ""
echo "--- 4. 提交 Docker 镜像 ---"
ssh root@${ITOP_HOST} "sleep 10 && docker commit smartauto-frontend itops-frontend:custom"
ssh root@${ITOP_HOST} "docker commit smartauto-backend itops-backend:custom"

# 5. 部署 Grafana
echo ""
echo "--- 5. 部署 Grafana ---"
scp scripts/install-grafana.sh root@${GRAFANA_HOST}:/tmp/
ssh root@${GRAFANA_HOST} "bash /tmp/install-grafana.sh"

echo ""
echo "=== 部署完成 ==="
echo "ITOps: http://10.127.19.18:8080 (admin/admin)"
echo "Grafana: http://10.127.19.17:3000 (admin/admin)"
