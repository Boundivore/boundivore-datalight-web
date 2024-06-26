#!/usr/bin/env bash

# 环境配置
#DATALIGHT_DIR="/opt/datalight"
#SERVICE_DIR="/srv/datalight"
#LOG_DIR="/data/datalight/logs"
#PID_DIR="/data/datalight/pids"
#DATA_DIR="/data/datalight/data"

# 服务名称
SERVICE_NAME="ZKUI"

# 文件路径定义
PID_FILE="${PID_DIR}/${SERVICE_NAME}/zkui.pid"
LOG_FILE="${LOG_DIR}/${SERVICE_NAME}/zkui.out"

# 获取当前脚本所在目录
bin_dir=$(realpath "$(dirname "${BASH_SOURCE[0]}")")

jar_name="zkui-2.0.0.jar"
jar_path="${bin_dir}/${jar_name}"
log_config_path="file:${bin_dir}/log4j.properties"

# shellcheck disable=SC2164
cd "${bin_dir}"

# 确保 PID 和日志目录存在
mkdir -p "$(dirname "${PID_FILE}")"
mkdir -p "$(dirname "${LOG_FILE}")"

ZKUIServer_JMX_OPTS=(
    "-Djava.net.preferIPv4Stack=true"
    "-Dcom.sun.management.jmxremote.authenticate=false"
    "-Dcom.sun.management.jmxremote.ssl=false"
    "-Dcom.sun.management.jmxremote.local.only=false"
    "-Dcom.sun.management.jmxremote.port={{jmxRemotePort_ZKUIServer}}"
    "-javaagent:${DATALIGHT_DIR}/exporter/jar/jmx_exporter.jar={{jmxExporterPort_ZKUIServer}}:${SERVICE_DIR}/ZKUI/exporter/conf/jmx_config_ZKUIServer.yaml"
)

start() {
    echo "Starting ${SERVICE_NAME}..."
    if [ -f "${PID_FILE}" ]; then
        if kill -9 "$(cat "${PID_FILE}")" > /dev/null 2>&1; then
            echo "${SERVICE_NAME} was already started."
            exit 1
        fi
    fi

    nohup java "${ZKUIServer_JMX_OPTS[@]}" -jar -Dlog4j.configuration="${log_config_path}" "${jar_path}" > "${LOG_FILE}" 2>&1 < /dev/null &
    echo "${SERVICE_NAME} started successfully."
}


stop() {
  echo "Stopping ${SERVICE_NAME} ..."
      local pids
      pids=$(ps -aux | grep "[j]ava .*${jar_name}" | awk '{print $2}')
      if [ -n "${pids}" ]; then
          kill -9 ${pids}
          echo "${SERVICE_NAME} stopped successfully."
      else
          echo "No ${SERVICE_NAME} process found."
      fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac

exit 0