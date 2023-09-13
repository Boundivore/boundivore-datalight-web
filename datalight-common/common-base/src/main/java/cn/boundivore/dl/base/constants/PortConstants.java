/**
 * Copyright (C) <2023> <Boundivore> <boundivore@foxmail.com>
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the Apache License, Version 2.0
 * as published by the Apache Software Foundation.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * Apache License, Version 2.0 for more details.
 * <p>
 * You should have received a copy of the Apache License, Version 2.0
 * along with this program; if not, you can obtain a copy at
 * http://www.apache.org/licenses/LICENSE-2.0.
 */
package cn.boundivore.dl.base.constants;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Description: 端口号常量类
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2023/8/11
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
public class PortConstants {
    // <ServiceName-ComponentName, ExporterPort>
    public final static Map<String, String> MONITOR_EXPORTER_PORT_MAP = new LinkedHashMap<String, String>() {
        {
            put("MONITOR-AlertManager", "9093");
            put("MONITOR-Prometheus", "9090");
            put("MONITOR-Grafana", "3000");
            put("MONITOR-MySQLExporter", "9104");
            put("MONITOR-NodeExporter", "9100");

            put("ZOOKEEPER-QuarumPeermain", "7001");

            put("HDFS-JournalNode", "7002");
            put("HDFS-NameNode", "7003");
            put("HDFS-ZKFailoverController", "7004");
            put("HDFS-DataNode", "7005");
            put("HDFS-HttpFS", "7006");

            put("YARN-ResourceManager", "7007");
            put("YARN-NodeManager", "7008");
            put("YARN-TimelineServer", "7009");
            put("YARN-HistoryServer", "7010");

            put("HIVE-MetaStore", "7011");
            put("HIVE-HiveServer2", "7012");

        }
    };

    // <ServiceName-ComponentName, RemotePort>
    public final static Map<String, String> MONITOR_REMOTE_PORT_MAP = new LinkedHashMap<String, String>() {
        {
            put("ZOOKEEPER-QuarumPeermain", "6001");

            put("HDFS-JournalNode", "6002");
            put("HDFS-NameNode", "6003");
            put("HDFS-ZKFailoverController", "6004");
            put("HDFS-DataNode", "6005");
            put("HDFS-HttpFS", "6006");

            put("YARN-ResourceManager", "6007");
            put("YARN-NodeManager", "6008");
            put("YARN-TimelineServer", "6009");
            put("YARN-HistoryServer", "6010");

            put("HIVE-MetaStore", "6011");
            put("HIVE-HiveServer2", "6012");
        }
    };

    /**
     * Description: 根据服务名称、组件名称获取 Monitor Exporter 端口号
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2023/8/11
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @param serviceName   服务名称
     * @param componentName 组件名称
     * @return Exporter 端口号
     */
    public static String getMonitorExporterPort(String serviceName, String componentName) {
        return MONITOR_EXPORTER_PORT_MAP.get(
                String.format(
                        "%s-%s",
                        serviceName,
                        componentName
                )
        );
    }

    /**
     * Description: 根据服务名称、组件名称获取 Monitor Remote 端口号
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2023/8/11
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @param serviceName   服务名称
     * @param componentName 组件名称
     * @return Remote 端口号
     */
    public static String getMonitorRemotePort(String serviceName, String componentName) {
        return MONITOR_REMOTE_PORT_MAP.get(
                String.format(
                        "%s-%s",
                        serviceName,
                        componentName
                )
        );
    }
}
