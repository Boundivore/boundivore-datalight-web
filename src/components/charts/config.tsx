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
		DATALIGHT: [
			{
				cols: [
					{
						rows: [
							{ title: '持续时间', type: 'text', query: 'druid_initial_size', span: 4, unit: '小时' },
							{
								title: '开始时间',
								type: 'time',
								query: `avg(process_start_time_seconds{job="${jobName}", instance=~"${instance}"})*1000`,
								span: 4,
								unit: '小时前'
							}
						]
					},

					{
						title: 'heap',
						type: 'gauge',
						span: 10,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="heap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="heap"})`
					},
					{
						title: 'non-heap',
						type: 'gauge',
						span: 10,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})`
					}
				],
				height: '350px',
				key: 1
			},
			// {
			// 	cols: [
			// 		{
			// 			title: 'heap',
			// 			type: 'gauge',
			// 			span: 12,
			// 			query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="heap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="heap"})`
			// 		},
			// 		{
			// 			title: 'non-heap',
			// 			type: 'gauge',
			// 			span: 12,
			// 			query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="nonheap"})`
			// 		}
			// 	],
			// 	key: 2,
			// 	height: '300px'
			// },
			{
				cols: [
					{
						title: 'CPU Usage',
						type: 'line',
						span: 12,
						query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
					},
					{
						title: 'Load Average',
						type: 'line',
						span: 12,
						query: `system_load_average_1m{job="${jobName}", instance=~"${instance}"}`
					}
				],
				key: 3
			}
		],
		'HDFS-DataNode': [
			{
				cols: [
					{ title: '持续时间', type: 'text', query: 'druid_initial_size', span: 12 },
					{ title: '开始时间', type: 'text', query: 'druid_initial_size', span: 12 }
				],
				height: '150px',
				key: 1
			},
			{
				cols: [
					{
						title: 'heap',
						type: 'gauge',
						span: 12,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="heap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="heap"})`
					},
					{
						title: 'non-heap',
						type: 'gauge',
						span: 12,
						query: `sum(jvm_memory_used_bytes{job="${jobName}", instance=~"${instance}", area="heap"})*100/sum(jvm_memory_max_bytes{job="${jobName}", instance=~"${instance}", area="heap"})`
					}
				],
				key: 2
			},
			{
				cols: [
					{
						title: 'CPU Usage',
						type: 'line',
						span: 12,
						query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
					},
					{
						title: 'Load Average',
						type: 'line',
						span: 12,
						query: `system_cpu_usage{job="${jobName}", instance=~"${instance}"}`
					}
				],
				key: 3
			}
		]
	};
};
