#!/bin/bash

# 全局路径变量参考：
# DATALIGHT_DIR="/opt/datalight"
# SERVICE_DIR="/srv/datalight"
# LOG_DIR="/data/datalight/logs"
# PID_DIR="/data/datalight/pids"
# DATA_DIR="/data/datalight/data"

# 检查是否以 root 身份运行脚本
if [ "$EUID" -ne 0 ]; then
  echo "Please run the script with root privileges."
  exit 1
fi

# 创建 SSSD 日志目录
mkdir -p "${LOG_DIR}/SSSD"

# 检查并创建符号链接
if [ ! -L "${LOG_DIR}/SSSD/sssd" ]; then
  ln -s /var/log/sssd "${LOG_DIR}/SSSD/"
else
  echo "Symbolic link already exists."
fi

exit 0