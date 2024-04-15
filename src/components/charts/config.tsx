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
/**
 * 监控想配置文件
 * @author Tracy.Guo
 */

export const monitorItems = [
	{ uid: 'DATALIGHT' },
	{ uid: 'HDFS-DataNode' },
	{ uid: 'HDFS-HttpFS' },
	{ uid: 'HDFS-JournalNode' },
	{ uid: 'HDFS-NameNode' },
	{ uid: 'HDFS-ZKFailoverController' },
	{ uid: 'HIVE-MetaStore' },
	{ uid: 'HIVE-TezUI' },
	{ uid: 'MONITOR-Alertmanager' },
	{ uid: 'MONITOR-Grafana' },
	{ uid: 'MONITOR-MySQLExporter' },
	{ uid: 'MONITOR-NodeExporter' },
	{ uid: 'MONITOR-Prometheus' },
	{ uid: 'YARN-HistoryServer' },
	{ uid: 'YARN-ResourceManager' },
	{ uid: 'YARN-TimelineServer' },
	{ uid: 'ZOOKEEPER-QuarumPeermain' }
];
export const paramsConfig = {
	DATALIGHT: ['jobName', 'instance']
};
export const config = (jobName, instance) => {
	return {
		HOME: [
			{
				cols: [
					{ title: '服务数量', key: '1-1', type: 'self', query: 'druid_initial_size', span: 4, unit: '' },
					{
						title: '已部署组件数',
						key: '1-2',
						type: 'number',
						query: `count(up)`,
						span: 4,
						unit: ''
					},
					{
						title: 'CPU Cores',
						key: '1-3',
						type: 'number',
						query: `count(count(node_cpu_seconds_total{instance="${instance}",job="${jobName}"}) by (cpu))`,
						span: 4,
						unit: ''
					},
					{
						title: 'RootFS Total',
						key: '1-4',
						type: 'byte',
						query: `node_filesystem_size_bytes{instance="${instance}",job="${jobName}",mountpoint="/",fstype!="rootfs"}`,
						span: 4,
						unit: 'GiB'
					},
					{
						title: 'RAM Total',
						key: '1-5',
						type: 'byte',
						query: `node_memory_MemTotal_bytes{instance="${instance}",job="${jobName}"}`,
						span: 4,
						unit: 'GiB'
					},
					{
						title: 'SWAP Total',
						key: '1-6',
						type: 'byte',
						query: `node_memory_SwapTotal_bytes{instance="${instance}",job="${jobName}"}`,
						span: 4,
						unit: 'GiB'
					}
				],
				height: '150px',
				key: '1'
			},
			{
				cols: [
					{
						title: 'CPU Busy',
						key: '2-1',
						type: 'gauge',
						span: 6,
						query: `(sum by(instance) (irate(node_cpu_seconds_total{instance="${instance}",job="${jobName}", mode!="idle"}[5m])) / on(instance) group_left sum by (instance)((irate(node_cpu_seconds_total{instance="${instance}",job="${jobName}"}[5m])))) * 100`
					},
					{
						title: 'Sys Load (5m avg)',
						key: '2-2',
						type: 'gauge',
						span: 6,
						query: `avg(node_load5{instance="${instance}",job="${jobName}"}) /  count(count(node_cpu_seconds_total{instance="${instance}",job="${jobName}"}) by (cpu)) * 100`
					},
					{
						title: 'Sys Load (15m avg)',
						key: '2-3',
						type: 'gauge',
						span: 6,
						query: `avg(node_load15{instance="${instance}",job="${jobName}"}) /  count(count(node_cpu_seconds_total{instance="${instance}",job="${jobName}"}) by (cpu)) * 100`
					},
					{
						title: 'RAM Used',
						key: '2-4',
						type: 'gauge',
						span: 6,
						query: `((node_memory_MemTotal_bytes{instance="${instance}",job="${jobName}"} - node_memory_MemFree_bytes{instance="${instance}",job="${jobName}"}) / (node_memory_MemTotal_bytes{instance="${instance}",job="${jobName}"} )) * 100`
					}
				],
				key: '2',
				height: '250px'
			},
			{
				cols: [
					{
						title: 'CPU Basic',
						key: '3-1',
						type: 'line',
						span: 12,
						// query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
						query: `label_replace(
                            sum by (instance) (
                              irate(node_cpu_seconds_total{instance="${instance}",job="${jobName}",mode="system"}[5m])
                            )
                          / on (instance) group_left ()
                            sum by (instance) ((irate(node_cpu_seconds_total{instance="${instance}",job="${jobName}"}[5m]))),
                          "device",
                          "system",
                          "",
                          ""
                        )
                      or
                        label_replace(
                            sum by (instance) (
                              irate(node_cpu_seconds_total{instance="${instance}",job="${jobName}",mode="user"}[5m])
                            )
                          / on (instance) group_left ()
                            sum by (instance) ((irate(node_cpu_seconds_total{instance="${instance}",job="${jobName}"}[5m]))),
                          "device",
                          "user",
                          "",
                          ""
                        )`
					},
					{
						title: 'Memory Basic',
						key: '3-2',
						type: 'line',
						span: 12,
						// query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
						query: `label_replace(
                            node_memory_MemTotal_bytes{instance="${instance}",job="${jobName}"},
                            "device",
                            "total",
                            "",
                            ""
                          )
                        or
                          label_replace(
                            (
                                  node_memory_MemTotal_bytes{instance="${instance}",job="${jobName}"}
                                -
                                  node_memory_MemFree_bytes{instance="${instance}",job="${jobName}"}
                              -
                                (
                                      node_memory_Cached_bytes{instance="${instance}",job="${jobName}"}
                                    +
                                      node_memory_Buffers_bytes{instance="${instance}",job="${jobName}"}
                                  +
                                    node_memory_SReclaimable_bytes{instance="${instance}",job="${jobName}"}
                                )
                            ),
                            "device",
                            "used",
                            "",
                            ""
                          )
                      or
                        label_replace(
                          (
                                node_memory_Cached_bytes{instance="${instance}",job="${jobName}"}
                              +
                                node_memory_Buffers_bytes{instance="${instance}",job="${jobName}"}
                            +
                              node_memory_SReclaimable_bytes{instance="${instance}",job="${jobName}"}
                          ),
                          "device",
                          "cache",
                          "",
                          ""
                        )
                     or
                        label_replace(
                            node_memory_MemFree_bytes{instance="${instance}",job="${jobName}"},
                            "device",
                            "free",
                            "",
                            ""
                        )
                    or
                        label_replace(
                        (
                            node_memory_SwapTotal_bytes{instance="${instance}",job="${jobName}"}
                            -
                            node_memory_SwapFree_bytes{instance="${instance}",job="${jobName}"}
                        ),
                        "device",
                        "swap_used",
                        "",
                        ""
                        )`
					}
				],
				key: '3',
				height: '300px'
			},
			{
				cols: [
					{
						title: 'Network Traffic Basic',
						key: '4-1',
						type: 'line',
						span: 12,
						query: `irate(node_network_receive_bytes_total{instance="${instance}",job="${jobName}"}[5m])*8 or irate(node_network_transmit_bytes_total{instance="${instance}",job="${jobName}"}[5m])*8`
					},
					{
						title: 'Disk Space Used Basic',
						key: '4-2',
						type: 'line',
						span: 12,
						query: `100 - ((node_filesystem_avail_bytes{instance="${instance}",job="${jobName}",device!~'rootfs'} * 100) / node_filesystem_size_bytes{instance="${instance}",job="${jobName}",device!~'rootfs'})`
					}
				],
				key: '4',
				height: '300px'
			}
		],
		DATALIGHT: [
			{
				cols: [
					{
						rows: [
							{ title: '持续时间', key: '1-1-1', type: 'text', query: 'druid_initial_size', span: 4, unit: '小时' },
							{
								title: '开始时间',
								key: '1-1-2',
								type: 'time',
								query: `avg(process_start_time_seconds{job="${jobName}", instance=~"${instance}"})*1000`,
								span: 4,
								unit: '小时前'
							}
						],
						span: 6,
						key: '1-1'
					},

					{
						title: 'heap',
						key: '1-2',
						type: 'gauge',
						span: 9,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="heap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="heap"})`
					},
					{
						title: 'non-heap',
						key: '1-3',
						type: 'gauge',
						span: 9,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})`
					}
				],
				height: '350px',
				key: '1'
			},
			{
				cols: [
					{
						title: 'CPU Usage',
						key: '2-1',
						type: 'line',
						span: 12,
						query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
					},
					{
						title: 'Load Average',
						key: '2-2',
						type: 'line',
						span: 12,
						query: `system_load_average_1m{job="${jobName}", instance=~"${instance}"}`
					}
				],
				key: '2',
				height: '250px'
			}
		],
		'HDFS-DataNode': [
			{
				cols: [
					{
						rows: [
							{ title: '持续时间', key: '1-1-1', type: 'text', query: 'druid_initial_size', span: 4, unit: '小时' },
							{
								title: '开始时间',
								key: '1-1-2',
								type: 'time',
								query: `avg(process_start_time_seconds{job="${jobName}", instance=~"${instance}"})*1000`,
								span: 4,
								unit: '小时前'
							}
						],
						span: 6,
						key: '1-1'
					},

					{
						title: 'heap',
						key: '1-2',
						type: 'gauge',
						span: 9,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="heap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="heap"})`
					},
					{
						title: 'non-heap',
						key: '1-3',
						type: 'gauge',
						span: 9,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})`
					}
				],
				height: '350px',
				key: '1'
			},
			{
				cols: [
					{
						title: 'CPU Usage',
						key: '3-1',
						type: 'line',
						span: 12,
						query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
					},
					{
						title: 'Load Average',
						key: '3-2',
						type: 'line',
						span: 12,
						query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
					}
				],
				key: '2'
			}
		]
	};
};
