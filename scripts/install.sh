#!/bin/bash

apt -y update
apt -y install pipx python3 python3-pip
ln -s /usr/bin/python3 /usr/bin/python

mkdir -p /opt/secrets
cd /opt/secrets
echo $GOOGLE_CREDS > secrets.json
echo $FLASK_SECRET_KEY > flaskkey.txt

cd /opt
git clone 
pip install -r requirements.txt --break-system-packages
