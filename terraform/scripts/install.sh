#!/bin/bash

apt -y update
apt -y install pipx python3 python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools nginx
ln -s /usr/bin/python3 /usr/bin/python

mkdir -p /opt/secrets
cd /opt/secrets
echo ${GOOGLE_CREDS} > secrets.json
echo ${FLASK_SESSION_KEY} > flaskkey.txt
echo ${LD_API_KEY} > ldapikey.txt

cd /opt
git clone https://github.com/launchdarkly-labs/ld-demo-manager.git
cd ld-demo-manager
pip install -r requirements.txt --break-system-packages
pip install wheel --break-system-packages
pip install gunicorn --break-system-packages
pip install cachelib --break-system-packages

cat > /etc/systemd/system/demo-manager.service <<-EOF
[Unit]
Description=Demo Manager
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=root
WorkingDirectory=/opt/ld-demo-manager
ExecStart=/usr/local/bin/gunicorn --config config.py manager:app

[Install]
WantedBy=multi-user.target
EOF

systemctl enable demo-manager
systemctl start demo-manager

