#!/bin/bash

apt -y update
apt -y install pipx python3 python3-pip
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