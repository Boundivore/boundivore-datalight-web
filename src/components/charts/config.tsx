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
export const config = {
	HOME: [
		{
			cols: [
				{ title: '服役节点数', key: '1-1', type: 'self', name: 'nodeCount', span: 3, unit: '' },
				{ title: '服务数量', key: '1-2', type: 'self', name: 'serviceCount', span: 3, unit: '' },
				{
					title: '部署组件数',
					key: '1-3',
					type: 'number',
					query: `count(up)`,
					span: 3,
					unit: ''
				},
				{
					title: 'CPU Cores',
					key: '1-4',
					type: 'number',
					query: `count(count by (instance, cpu) (node_cpu_seconds_total))`,
					span: 3,
					unit: ''
				},
				{
					title: 'RootFS Total',
					key: '1-5',
					type: 'byte',
					query: `sum(node_filesystem_size_bytes{job="MONITOR-NodeExporter", mountpoint="/", fstype!="rootfs"}) / (1024 * 1024)`,
					span: 4,
					unit: 'GiB'
				},
				{
					title: 'RAM Total',
					key: '1-6',
					type: 'byte',
					query: `sum(node_memory_MemTotal_bytes{job="MONITOR-NodeExporter"}) / (1024 * 1024)`,
					span: 4,
					unit: 'GiB'
				},
				{
					title: 'SWAP Total',
					key: '1-7',
					type: 'byte',
					query: `sum(node_memory_SwapTotal_bytes{job="MONITOR-NodeExporter"}) / (1024 * 1024)`,
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
					query: `(
                        sum(
                          irate(node_cpu_seconds_total{job="MONITOR-NodeExporter", mode!="idle"}[1m])
                        ) 
                        / 
                        sum(
                          irate(node_cpu_seconds_total{job="MONITOR-NodeExporter"}[1m])
                        )
                      ) * 100`
				},
				{
					title: 'Sys Load (5m avg)',
					key: '2-2',
					type: 'gauge',
					span: 6,
					query: `(
                        avg(node_load5{job="MONITOR-NodeExporter"})
                      /
                        count(count by (cpu) (node_cpu_seconds_total{job="MONITOR-NodeExporter"}))
                    )
                  *
                    100`
				},
				{
					title: 'Sys Load (15m avg)',
					key: '2-3',
					type: 'gauge',
					span: 6,
					query: `(
                        avg(node_load15{job="MONITOR-NodeExporter"})
                      /
                        count(count by (cpu) (node_cpu_seconds_total{job="MONITOR-NodeExporter"}))
                    )
                  *
                    10`
				},
				{
					title: 'RAM Used',
					key: '2-4',
					type: 'gauge',
					span: 6,
					query: `avg(
                        (
                            (
                                    node_memory_MemTotal_bytes{job="MONITOR-NodeExporter"}
                                  -
                                    node_memory_MemFree_bytes{job="MONITOR-NodeExporter"}
                                -
                                  node_memory_Buffers_bytes{job="MONITOR-NodeExporter"}
                              -
                                node_memory_Cached_bytes{job="MONITOR-NodeExporter"}
                            )
                          /
                            node_memory_MemTotal_bytes{job="MONITOR-NodeExporter"}
                        )
                      *
                        100
                    )`
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
					// query: `system_cpu_usage{job="{jobName}", instance=~"{instance}"}`
					query: `label_replace(
                        avg(
                            sum by (instance) (irate(node_cpu_seconds_total{job="MONITOR-NodeExporter",mode="system"}[5m]))
                          / on (instance) group_left 
                            sum by (instance) (irate(node_cpu_seconds_total{job="MONITOR-NodeExporter"}[5m]))
                        ),
                          "device",
                          "system",
                          "",
                          ""
                        )
                      or
                        label_replace(
                            avg(sum by(instance) (
                                irate(node_cpu_seconds_total{job="MONITOR-NodeExporter", mode="user"}[5m])
                              ) 
                              / 
                              on(instance) group_left 
                              sum by(instance) (
                                irate(node_cpu_seconds_total{job="MONITOR-NodeExporter"}[5m])
                              )),
                          "device",
                          "user",
                          "",
                          ""
                        )
                        or
                        label_replace(
                            avg(
                                sum by(instance) (
                                  irate(node_cpu_seconds_total{job="MONITOR-NodeExporter", mode="iowait"}[5m])
                                ) 
                                / 
                                on(instance) group_left 
                                sum by(instance) (
                                  irate(node_cpu_seconds_total{job="MONITOR-NodeExporter"}[5m])
                                )
                              ),
                            "device",
                            "iowait",
                            "",
                            ""
                        )
                        or
                        label_replace(
                            sum(
                                sum by(instance) (
                                  irate(node_cpu_seconds_total{job="MONITOR-NodeExporter", mode=~".*irq"}[5m])
                                ) 
                                / 
                                on(instance) group_left 
                                sum by(instance) (
                                  irate(node_cpu_seconds_total{job="MONITOR-NodeExporter"}[5m])
                                )
                              ) 
                              / 
                              count(node_cpu_seconds_total{job="MONITOR-NodeExporter", mode=~".*irq"}),
                            "device",
                            "irq",
                            "",
                            ""
                        )
                        or 
                        label_replace(
                            sum(
                                sum by (instance) (
                                  irate(
                                    node_cpu_seconds_total{job="MONITOR-NodeExporter",mode!="idle",mode!="iowait",mode!="irq",mode!="softirq",mode!="system",mode!="user"}[5m]
                                  )
                                )
                              / on (instance) group_left 
                                sum by (instance) (irate(node_cpu_seconds_total{job="MONITOR-NodeExporter"}[5m]))
                            )
                          /
                            count(
                              node_cpu_seconds_total{job="MONITOR-NodeExporter",mode!="idle",mode!="iowait",mode!="irq",mode!="softirq",mode!="system",mode!="user"}
                            ),
                            "device",
                            "other",
                            "",
                            ""
                        )
                        or
                        label_replace(
                            avg(
                                sum by (instance) (irate(node_cpu_seconds_total{job="MONITOR-NodeExporter",mode="idle"}[5m]))
                              / on (instance) group_left 
                                sum by (instance) (irate(node_cpu_seconds_total{job="MONITOR-NodeExporter"}[5m]))
                            ),
                            "device",
                            "idle",
                            "",
                            ""
                        )`,
					multiple: true
				},
				{
					title: 'Memory Basic',
					key: '3-2',
					type: 'line',
					span: 12,
					// query: `system_cpu_usage{job="{jobName}", instance=~"{instance}"}`
					query: `label_replace(
                            sum(node_memory_MemTotal_bytes{job="MONITOR-NodeExporter"}),
                            "device",
                            "total",
                            "",
                            ""
                          )
                        or
                          label_replace(
                            sum(
                                node_memory_MemTotal_bytes{job="MONITOR-NodeExporter"} 
                                - node_memory_MemFree_bytes{job="MONITOR-NodeExporter"} 
                                - (
                                    node_memory_Cached_bytes{job="MONITOR-NodeExporter"} 
                                    + node_memory_Buffers_bytes{job="MONITOR-NodeExporter"} 
                                    + node_memory_SReclaimable_bytes{job="MONITOR-NodeExporter"}
                                  )
                              ),
                            "device",
                            "used",
                            "",
                            ""
                          )
                      or
                        label_replace(
                            sum(
                                node_memory_Cached_bytes{job="MONITOR-NodeExporter"} 
                                + node_memory_Buffers_bytes{job="MONITOR-NodeExporter"} 
                                + node_memory_SReclaimable_bytes{job="MONITOR-NodeExporter"}
                              ),
                          "device",
                          "cache",
                          "",
                          ""
                        )
                     or
                        label_replace(
                            sum(node_memory_MemFree_bytes{job="MONITOR-NodeExporter"}),
                            "device",
                            "free",
                            "",
                            ""
                        )
                    or
                        label_replace(
                            sum(
                                node_memory_SwapTotal_bytes{job="MONITOR-NodeExporter"} 
                                - node_memory_SwapFree_bytes{job="MONITOR-NodeExporter"}
                              ),
                        "device",
                        "swap_used",
                        "",
                        ""
                        )`,
					multiple: true
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
					query: `sum by (device) (
                        irate(node_network_receive_bytes_total{job="MONITOR-NodeExporter"}[5m]) * 8
                      ) or sum by (device) (
                        irate(node_network_transmit_bytes_total{job="MONITOR-NodeExporter"}[5m]) * 8
                      )`,
					multiple: true // 是否是多条折线展示在一个坐标轴
				},
				{
					title: 'Disk Space Used Basic',
					key: '4-2',
					type: 'line',
					span: 12,
					query: `100 - avg by (mountpoint) (
                        node_filesystem_avail_bytes{job="MONITOR-NodeExporter", device!~"rootfs"} * 100
                        / node_filesystem_size_bytes{job="MONITOR-NodeExporter", device!~"rootfs"}
                      )`,
					multiple: true
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
							query: `avg(process_start_time_seconds{job="{jobName}", instance=~"{instance}"})*1000`,
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
					query: `sum(jvm_memory_used_bytes{job="{jobName}", instance=~"{instance}", area="heap"})*100/sum(jvm_memory_max_bytes{job="{jobName}", instance=~"{instance}", area="heap"})`
				},
				{
					title: 'non-heap',
					key: '1-3',
					type: 'gauge',
					span: 9,
					query: `sum(jvm_memory_used_bytes{job="{jobName}", instance=~"{instance}", area="nonheap"})*100/sum(jvm_memory_max_bytes{job="{jobName}", instance=~"{instance}", area="nonheap"})`
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
					query: `system_cpu_usage{job="{jobName}", instance=~"{instance}"}`
				},
				{
					title: 'Load Average',
					key: '2-2',
					type: 'line',
					span: 12,
					query: `system_load_average_1m{job="{jobName}", instance=~"{instance}"}`
				}
			],
			key: '2',
			height: '300px'
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
							query: `avg(process_start_time_seconds{job="{jobName}", instance=~"{instance}"})*1000`,
							span: 4,
							unit: '小时前'
						}
					],
					span: 6,
					key: '1-1'
				},

				{
					title: 'dn_capacity',
					key: '1-2',
					type: 'line',
					span: 9,
					query: `Hadoop_DataNode_Capacity{name="FSDatasetState", instance="{instance}"}`
				},
				{
					title: 'dn_dfs_used',
					key: '1-3',
					type: 'line',
					span: 9,
					query: `Hadoop_DataNode_DfsUsed{name="FSDatasetState", instance="{instance}"}`
				}
			],
			height: '350px',
			key: '1'
		},
		{
			cols: [
				{
					title: 'dn_remaining',
					key: '2-1',
					type: 'line',
					span: 12,
					query: `Hadoop_DataNode_Remaining{name="FSDatasetState", instance="{instance}"}`
				},
				{
					title: 'dn_last_volume_failures',
					key: '2-2',
					type: 'line',
					span: 12,
					query: `Hadoop_DataNode_VolumeFailures{instance="{instance}"}`
				}
			],
			key: '2'
		}
	]
};
