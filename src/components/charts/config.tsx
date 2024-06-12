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
 * @author Tracy
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
interface ConfigStyle {
	[key: string]: any[]; // 或者具体的值类型
}
export const config: ConfigStyle = {
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
					query: `sum(node_filesystem_size_bytes{job="MONITOR-NodeExporter", mountpoint="/", fstype!="rootfs"})`,
					span: 4
				},
				{
					title: 'RAM Total',
					key: '1-6',
					type: 'byte',
					query: `sum(node_memory_MemTotal_bytes{job="MONITOR-NodeExporter"})`,
					span: 4
				},
				{
					title: 'SWAP Total',
					key: '1-7',
					type: 'byte',
					query: `sum(node_memory_SwapTotal_bytes{job="MONITOR-NodeExporter"})`,
					span: 4
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
					height: 250,
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
					height: 250,
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
					height: 250,
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
					height: 250,
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
					// y轴换算
					formatter: {
						formatterType: `*`,
						formatterCount: 100,
						unit: '%'
					},
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
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'GiB'
					},
					query: `label_replace(
                            sum(node_memory_MemTotal_bytes{job="MONITOR-NodeExporter"}) / (1024 * 1024 * 1024),
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
                              ) /(1024 * 1024 * 1024),
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
                              ) /(1024 * 1024 * 1024),
                          "device",
                          "cache",
                          "",
                          ""
                        )
                     or
                        label_replace(
                            sum(node_memory_MemFree_bytes{job="MONITOR-NodeExporter"})/ (1024 * 1024 * 1024),
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
                              ) /(1024 * 1024 * 1024),
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
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'kb/s'
					},
					query: `sum by (device) (
                        irate(node_network_receive_bytes_total{job="MONITOR-NodeExporter"}[5m]) * 8
                      ) / 1000 or sum by (device) (
                        irate(node_network_transmit_bytes_total{job="MONITOR-NodeExporter"}[5m]) * 8
                      ) / 1000 `,
					multiple: true // 是否是多条折线展示在一个坐标轴
				},
				{
					title: 'Disk Space Used Basic',
					key: '4-2',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `*`,
						formatterCount: 1,
						unit: '%'
					},
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
							span: 4
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
						{
							title: '持续时间',
							key: '1-1-1',
							type: 'text',
							query: '(time() - java_lang_Runtime_StartTime{instance="{instance}"} / 1000) /  (60 * 60)',
							span: 4,
							unit: '小时'
						},
						{
							title: '开始时间',
							key: '1-1-2',
							type: 'time',
							query: `avg(process_start_time_seconds{job="{jobName}", instance=~"{instance}"})*1000`,
							span: 4
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
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'GB'
					},
					query: `Hadoop_DataNode_Capacity{name="FSDatasetState", instance="{instance}"} / (1024 * 1024 * 1024)`
				},
				{
					title: 'dn_dfs_used',
					key: '1-3',
					type: 'line',
					span: 9,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'kB'
					},
					query: `Hadoop_DataNode_DfsUsed{name="FSDatasetState", instance="{instance}"} / 1024`
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
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'GB'
					},
					query: `Hadoop_DataNode_Remaining{name="FSDatasetState", instance="{instance}"} / (1024 * 1024 * 1024)`
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
	],
	'HDFS-HttpFS': [
		{
			cols: [
				{
					title: '持续时间',
					key: '1-1',
					type: 'text',
					query: '(time() - java_lang_Runtime_StartTime{instance="{instance}"} / 1000) /  (60 * 60)',
					span: 12,
					unit: '小时'
				},
				{
					title: '开始时间',
					key: '1-2',
					type: 'time',
					query: `java_lang_Runtime_StartTime{instance="{instance}"}`,
					span: 12
				}
			]
		}
	],
	'HDFS-ZKFailoverController': [
		{
			cols: [
				{
					title: '开始时间',
					key: '1-2',
					type: 'time',
					query: `java_lang_Runtime_StartTime{instance="{instance}"}`,
					span: 12
				},
				{
					title: '持续时间',
					key: '1-1',
					type: 'text',
					query: '(time() - java_lang_Runtime_StartTime{instance="{instance}"} / 1000) /  (60 * 60)',
					span: 12,
					unit: '小时'
				}
			]
		}
	],
	'HIVE-MetaStore': [
		{
			cols: [
				{
					title: '开始时间',
					key: '1-2',
					type: 'time',
					query: `java_lang_Runtime_StartTime{instance="{instance}"}`,
					span: 12
				},
				{
					title: '持续时间',
					key: '1-1',
					type: 'text',
					query: '(time() - java_lang_Runtime_StartTime{instance="{instance}"} / 1000) /  (60 * 60)',
					span: 12,
					unit: '小时'
				}
			]
		}
	],
	'HDFS-JournalNode': [
		{
			cols: [
				{
					rows: [
						{
							title: '持续时间',
							key: '1-1-1',
							type: 'text',
							query: '(time() - java_lang_Runtime_StartTime{instance="{instance}"} / 1000) /  (60 * 60)',
							span: 4,
							unit: '小时'
						},
						{
							title: '开始时间',
							key: '1-1-2',
							type: 'time',
							query: `java_lang_Runtime_StartTime{instance="{instance}"}`,
							span: 4
						}
					],
					span: 6,
					key: '1-1'
				},

				{
					title: 'jn_syncs_60s_95th_percentile_latency_micros',
					key: '1-2',
					type: 'line',
					span: 9,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'μs'
					},
					query: `Hadoop_JournalNode_Syncs60s95thPercentileLatencyMicros`
				},
				{
					title: 'jn_syncs_60s_99th_percentile_latency_micros',
					key: '1-3',
					type: 'line',
					span: 9,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'μs'
					},
					query: `Hadoop_JournalNode_Syncs60s99thPercentileLatencyMicros`
				}
			],
			height: '350px',
			key: '1'
		},
		{
			cols: [
				{
					title: 'jn_syncs_300s_95th_percentile_latency_micros',
					key: '2-1',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'μs'
					},
					query: 'Hadoop_JournalNode_Syncs300s95thPercentileLatencyMicros'
				},
				{
					title: 'jn_syncs_300s_99th_percentile_latency_micros',
					key: '2-2',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'μs'
					},
					query: `Hadoop_JournalNode_Syncs300s99thPercentileLatencyMicros`
				}
			],
			key: '2'
		},
		{
			cols: [
				{
					title: 'jn_batches_written_rate',
					key: '3-1',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'c/s'
					},
					query: 'rate(Hadoop_JournalNode_BatchesWritten{instance="{instance}"}[1m])'
				},
				{
					title: 'nv_bytes_written_rate',
					key: '3-2',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'B/s'
					},
					query: `rate(Hadoop_JournalNode_BytesWritten{instance="{instance}"}[1m])`
				}
			],
			key: '3'
		},
		{
			cols: [
				{
					title: 'jjn_jvm_gc_count_rate',
					key: '4-1',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'c/s'
					},
					query: 'rate(Hadoop_JournalNode_GcCount{instance="{instance}"}[1m])'
				},
				{
					title: 'jn_jvm_gc_time_millis_rate',
					key: '4-2',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'ms'
					},
					query: `rate(Hadoop_JournalNode_GcTimeMillis{instance="{instance}"}[1m])`
				}
			],
			key: '4'
		},
		{
			cols: [
				{
					title: 'jn_jvm_mem_nonheap_usedM',
					key: '5-1',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'MB'
					},
					query: 'Hadoop_JournalNode_MemNonHeapUsedM{instance="{instance}"}'
				},
				{
					title: 'jn_mem_heap_usedM',
					key: '5-2',
					type: 'line',
					span: 12,
					formatter: {
						formatterType: `/`,
						formatterCount: 1,
						unit: 'MB'
					},
					query: `Hadoop_JournalNode_MemHeapUsedM{instance="{instance}"}`
				}
			],
			key: '5'
		}
	],
	'HDFS-NameNode': [
		{
			cols: [
				{
					rows: [
						{
							title: '持续时间',
							key: '1-1-1',
							type: 'text',
							query: '(time() - Hadoop_NameNode_NNStartedTimeInMillis{instance="{instance}"} / 1000) /  (60 * 60)',
							span: 4,
							unit: '小时'
						},
						{
							title: '开始时间',
							key: '1-1-2',
							type: 'time',
							query: `Hadoop_NameNode_NNStartedTimeInMillis{instance="{instance}"}`,
							span: 4
						}
					],
					span: 6,
					key: '1-1'
				},
				{
					title: 'nn_dn_total_capacity_remaining',
					key: '1-2',
					type: 'byte',
					span: 9,
					query: `Hadoop_NameNode_CapacityRemaining{ name="FSNamesystem",instance="{instance}"}`
				},
				{
					title: 'nn_dn_capacity_used',
					key: '1-3',
					type: 'byte',
					span: 9,
					query: `Hadoop_NameNode_CapacityUsed{name='FSNamesystem',instance="{instance}"}`
				}
			],
			height: '350px',
			key: '1'
		},
		{
			cols: [
				{
					title: 'nn_total_sync_count',
					key: '2-1',
					type: 'line',
					span: 12,
					query: `Hadoop_NameNode_TotalSyncCount{name='FSNamesystem'}`
				},
				{
					title: 'nn_file_created_ops',
					key: '2-2',
					type: 'line',
					span: 12,
					query: `avg(Hadoop_NameNode_CreateFileOps) by (instance)`
				}
			],
			key: '2'
		},
		{
			cols: [
				{
					title: 'nn_files_created',
					key: '3-1',
					type: 'line',
					span: 12,
					query: 'avg(Hadoop_NameNode_FilesCreated) by (instance)'
				},
				{
					title: 'nn_files_appended',
					key: '3-2',
					type: 'line',
					span: 12,
					query: `avg(Hadoop_NameNode_FilesAppended) by (instance)`
				}
			],
			key: '3'
		}
	]
};
