#!/bin/bash
# Grafana 9.5.21 安装脚本 - CentOS 7.9
set -e

GRAFANA_VERSION="9.5.21"
INSTALL_DIR="/opt/grafana-v${GRAFANA_VERSION}"

# 1. 下载
if [ ! -f /tmp/grafana.tar.gz ]; then
    echo "下载 Grafana ${GRAFANA_VERSION}..."
    curl -L -o /tmp/grafana.tar.gz https://dl.grafana.com/oss/release/grafana-${GRAFANA_VERSION}.linux-amd64.tar.gz
fi

# 2. 解压
echo "解压..."
tar xzf /tmp/grafana.tar.gz -C /opt/

# 3. 配置
echo "配置..."
cat > ${INSTALL_DIR}/conf/custom.ini << 'EOF'
[server]
http_port = 3000
domain = 10.127.19.17
root_url = %(protocol)s://%(domain)s:%(http_port)s/
serve_from_sub_path = true
allow_embedding = true

[auth.anonymous]
enabled = true
org_role = Viewer

[security]
allow_embedding = true
cookie_samesite = none
cookie_secure = false

[users]
default_theme = dark

[panels]
disable_sanitize_html = true
EOF

# 4. 创建 systemd 服务
cat > /etc/systemd/system/grafana.service << 'EOF'
[Unit]
Description=Grafana
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/grafana-v9.5.21/bin/grafana-server --config=/opt/grafana-v9.5.21/conf/custom.ini --homepath=/opt/grafana-v9.5.21
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable grafana
systemctl start grafana || systemctl restart grafana

# 5. 开放防火墙
firewall-cmd --add-port=3000/tcp --permanent 2>/dev/null
firewall-cmd --reload 2>/dev/null

# 6. 等待启动
sleep 10

# 7. 配置数据源和仪表盘
echo "配置 Prometheus 数据源..."
curl -s -X POST http://admin:admin@localhost:3000/api/datasources \
  -H 'Content-Type: application/json' \
  -d '{"name":"Prometheus","type":"prometheus","url":"http://localhost:9090","access":"proxy","isDefault":true}'

echo "创建 SNMP 仪表盘..."
curl -s -X POST http://admin:admin@localhost:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @/tmp/snmp-dashboard.json 2>/dev/null || echo "仪表盘需要手动导入 /tmp/snmp-dashboard.json"

echo ""
echo "Grafana 安装完成!"
echo "访问: http://10.127.19.17:3000 (admin/admin)"
