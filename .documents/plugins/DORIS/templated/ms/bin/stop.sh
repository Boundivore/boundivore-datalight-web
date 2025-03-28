#!/usr/bin/bash
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
curdir="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
DORIS_HOME="$(
    cd "${curdir}/.." || exit 1
    pwd
)"

cd "${DORIS_HOME}" || exit 1

process=doris_cloud

PID_DIR="{{PID_DIR}}"
export PID_DIR

if [[ ! -f "${PID_DIR}/${process}.pid" ]]; then
    echo "no ${process}.pid found, process may have been stopped"
    exit 1
fi

pid=$(cat "${PID_DIR}/${process}.pid")
kill -2 "${pid}"
cnt=0
while true; do
    cnt=$((cnt + 1))
    echo "waiting ${pid} to quit, ${cnt} seconds elapsed"
    msg=$(ps "${pid}")
    ret=$?
    if [[ ${ret} -ne 0 ]]; then
        echo "${pid} has quit"
        break
    fi
    echo "${msg}"
    sleep 1
done
rm -f "${PID_DIR}/${process}.pid"
