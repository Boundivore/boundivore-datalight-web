#!/bin/bash

set -e

# 检查是否以 root 身份运行脚本
if [ "$EUID" -ne 0 ]; then
  echo "Please run the script with root privileges."
  exit 1
fi

# shellcheck disable=SC2034
USER_NAME="datalight"
# shellcheck disable=SC2034
GROUP_NAME="datalight"

SERVICE_NAME="KUBESPHERE"

CURRENT_SERVICE_DIR="${SERVICE_DIR}/${SERVICE_NAME}"
KUBESPHERE_DLC_DIR="${DATALIGHT_DIR}/plugins/${SERVICE_NAME}/dlc"
BIN_DIR="${CURRENT_SERVICE_DIR}/bin"
CONFIG_DIR="${CURRENT_SERVICE_DIR}/conf"

# 授权可执行权限
chmod +x -R "${BIN_DIR}"

# 准备部署 KubeSphere 集群
echo "Prepare to create cluster of kubesphere"
EXEC="${BIN_DIR}/kk create cluster \
-f ${CONFIG_DIR}/datalight-config-auth-harbor.yaml \
-a ${KUBESPHERE_DLC_DIR}/kubesphere-artifact.tar.gz --with-packages"

/usr/bin/expect <<-EOF
    set timeout -1
    spawn sh -c "${EXEC}"
    expect {
        "Continue this installation*" { send "yes\r"; exp_continue }
        eof
    }
EOF
