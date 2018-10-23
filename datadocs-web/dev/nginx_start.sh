#!/usr/bin/env bash
echo 'This is a nginx start script'

sed -i 's|SERVER_NAME|'"${SERVER_NAME}"'|g' /etc/nginx/conf.d/datadocs.conf
sed -i 's|PROXY_URL_PORT|'"${PROXY_URL_PORT}"'|g' /etc/nginx/conf.d/datadocs.conf

/usr/sbin/nginx