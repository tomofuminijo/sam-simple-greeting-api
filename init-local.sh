#!/bin/sh

LOCAL_IP=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)

sed -e s/LOCAL_IP/${LOCAL_IP}/g local-env.json.org > local-env.json
