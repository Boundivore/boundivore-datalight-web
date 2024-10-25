#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# JAVA_HOME, will use it to start DolphinScheduler server
export JAVA_HOME=${JAVA_HOME}

# Database related configuration, set database type, username and password
export DATABASE=mysql
export SPRING_PROFILES_ACTIVE=${DATABASE}
export SPRING_DATASOURCE_URL="jdbc:mysql://{{db_host}}:{{db_port}}/{{db_name}}?useSSL=false&createDatabaseIfNotExist=true"
export SPRING_DATASOURCE_USERNAME="{{db_root_user}}"
export SPRING_DATASOURCE_PASSWORD="{{db_root_password}}"

# DolphinScheduler server related configuration
export SPRING_CACHE_TYPE=${SPRING_CACHE_TYPE:-none}
export SPRING_JACKSON_TIME_ZONE=${SPRING_JACKSON_TIME_ZONE:-UTC}
export MASTER_FETCH_COMMAND_NUM=${MASTER_FETCH_COMMAND_NUM:-10}

# Registry center configuration, determines the type and link of the registry center
export REGISTRY_TYPE=${REGISTRY_TYPE:-zookeeper}
export REGISTRY_ZOOKEEPER_CONNECT_STRING="{{REGISTRY_ZOOKEEPER_CONNECT_STRING}}"

# Tasks related configurations, need to change the configuration if you use the related tasks.
export HADOOP_HOME=/srv/datalight/YARN
export HADOOP_CONF_DIR=/srv/datalight/YARN/etc/hadoop
export SPARK_HOME1=/srv/datalight/SPARK
export SPARK_HOME2=/srv/datalight/SPARK
export PYTHON_HOME=/usr/bin/python
export HIVE_HOME=/srv/datalight/HIVE
export FLINK_HOME=/srv/datalight/FLINK
export DATAX_HOME=/srv/datalight/DATAX
export SEATUNNEL_HOME=/srv/datalight/SEATUNNEL
export CHUNJUN_HOME=/srv/datalight/CHUNJUN

export PATH=$HADOOP_HOME/bin:$SPARK_HOME1/bin:$SPARK_HOME2/bin:$PYTHON_HOME/bin:$JAVA_HOME/bin:$HIVE_HOME/bin:$FLINK_HOME/bin:$DATAX_HOME/bin:$SEATUNNEL_HOME/bin:$CHUNJUN_HOME/bin:$PATH
