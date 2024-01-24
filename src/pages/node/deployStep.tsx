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
 * DeployStep - 部署步骤
 * @author Tracy.Guo
 */
import { forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Progress, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from './hooks/usePolling';

const { Text } = Typography;
interface DataType {
	[x: string]: any;
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
const twoColors = { '0%': '#108ee9', '100%': '#87d068' };

const DeployStep: React.FC = forwardRef((props, ref) => {
	const { selectedRowsList, setSelectedRowsList, stableState } = useStore();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			width: 100,
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.deployProgress'),
			dataIndex: 'ExecProgress',
			width: 350,
			render: (text, record) => {
				console.log(4444, record);
				return <Progress percent={Number(text).toFixed(2)} strokeColor={twoColors} />;
			}
		},
		{
			title: t('node.detail'),
			dataIndex: 'ExecProgressStepList',
			render: (text: []) => {
				const runningStep = text.find(step => step.StepExecState === 'RUNNING');
				return runningStep ? <Text>{runningStep.StepName}</Text> : null;
			}
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedRowsList(selectedRows);
		},
		defaultSelectedRowKeys: selectedRowsList.map(({ NodeId }) => {
			return NodeId;
		}),
		getCheckboxProps: (record: DataType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiStartWorker = APIConfig.startWorker;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'START_WORKER',
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiStartWorker, params);
		return Promise.resolve(jobData);
	};

	const getSpeed = async () => {
		// const api = APIConfig.jobProgress;
		// const progressData = await RequestHttp.get(api, { params: { JobId: '1749668806583455745' } });
		const progressData = {
			Timestamp: '1705988588941',
			Code: '00000',
			Message: '成功',
			MessageType: '成功',
			Data: {
				ClusterId: '1749625240318504962',
				JobId: '1749668806583455745',
				JobPlanProgress: {
					ClusterId: '1749625240318504962',
					JobId: '1749668806583455745',
					ActionType: 'DEPLOY',
					PlanTotal: '76',
					PlanCurrent: '76',
					PlanProgress: '100',
					PlanName: 'DEPLOY:HDFS:DataNode[node01]:部署后启动 DataNode'
				},
				JobExecProgress: {
					JobExecStateEnum: 'RUNNING',
					ClusterId: '1749625240318504962',
					JobId: '1749668806583455745',
					ExecTotal: '77',
					ExecCurrent: '51',
					ExecProgress: '66',
					ExecProgressPerNodeList: [
						{
							NodeId: '1749625291073777669',
							Hostname: 'node01',
							NodeIp: '192.168.137.10',
							ExecTotal: '32',
							ExecCurrent: '22',
							ExecProgress: '68',
							ExecProgressStepList: [
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806650564609',
									StepName: 'DEPLOY:MONITOR:Prometheus[node01]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806650564610',
									StepName: 'DEPLOY:MONITOR:Prometheus[node01]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806650564611',
									StepName: 'DEPLOY:MONITOR:Prometheus[node01]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806650564612',
									StepName: 'DEPLOY:MONITOR:Prometheus[node01]:部署后启动 Prometheus',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806650564614',
									StepName: 'DEPLOY:MONITOR:AlertManager[node01]:部署后启动 AlertManager',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806650564616',
									StepName: 'DEPLOY:MONITOR:MySQLExporter[node01]:部署后启动 MySQLExporter',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806650564618',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node01]:部署后启动 NodeExporter',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806650564630',
									StepName: 'DEPLOY:MONITOR:Grafana[node01]:部署后启动 Grafana',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806671536131',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node01]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806671536132',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node01]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806671536133',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node01]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806671536134',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node01]:部署后启动 QuarumPeermain',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806671536146',
									StepName: 'DEPLOY:ZOOKEEPER:ZookeeperClient[node01]:正在完成 Client 部署',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924739',
									StepName: 'DEPLOY:HDFS:JournalNode[node01]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924740',
									StepName: 'DEPLOY:HDFS:JournalNode[node01]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806679924741',
									StepName: 'DEPLOY:HDFS:JournalNode[node01]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924742',
									StepName: 'DEPLOY:HDFS:JournalNode[node01]:部署后启动 JournalNode',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924754',
									StepName: 'DEPLOY:HDFS:NameNode1[node01]:格式化 NameNode1',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924755',
									StepName: 'DEPLOY:HDFS:NameNode1[node01]:部署后启动 NameNode1',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924760',
									StepName: 'DEPLOY:HDFS:ZKFailoverController1[node01]:格式化 ZKFC',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924761',
									StepName: 'DEPLOY:HDFS:ZKFailoverController1[node01]:部署后启动 ZKFailoverController1',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924765',
									StepName: 'DEPLOY:HDFS:DataNode[node01]:部署后启动 DataNode',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924771',
									StepName: 'DEPLOY:HDFS:HttpFS[node01]:部署后启动 HttpFS',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806679924775',
									StepName: 'DEPLOY:HDFS:HDFSClient[node01]:正在完成 Client 部署',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924782',
									StepName: 'DEPLOY:YARN:ResourceManager1[node01]:清理过期的部署环境',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924783',
									StepName: 'DEPLOY:YARN:ResourceManager1[node01]:初始化部署服务所需的环境',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806679924784',
									StepName: 'DEPLOY:YARN:ResourceManager1[node01]:初始化服务配置文件',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924785',
									StepName: 'DEPLOY:YARN:ResourceManager1[node01]:部署后启动 ResourceManager1',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806705090568',
									StepName: 'DEPLOY:YARN:NodeManager[node01]:部署后启动 NodeManager',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806705090577',
									StepName: 'DEPLOY:YARN:TimelineServer[node01]:部署后启动 TimelineServer',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806705090579',
									StepName: 'DEPLOY:YARN:HistoryServer[node01]:部署后启动 HistoryServer',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806705090581',
									StepName: 'DEPLOY:YARN:YARNClient[node01]:正在完成 Client 部署',
									StepExecState: 'SUSPEND'
								}
							]
						},
						{
							NodeId: '1749625291086360577',
							Hostname: 'node02',
							NodeIp: '192.168.137.11',
							ExecTotal: '25',
							ExecCurrent: '16',
							ExecProgress: '64',
							ExecProgressStepList: [
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806650564620',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node02]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806650564621',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node02]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806650564622',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node02]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806650564623',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node02]:部署后启动 NodeExporter',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806671536136',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node02]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806671536137',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node02]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806671536138',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node02]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806671536139',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node02]:部署后启动 QuarumPeermain',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806671536148',
									StepName: 'DEPLOY:ZOOKEEPER:ZookeeperClient[node02]:正在完成 Client 部署',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924744',
									StepName: 'DEPLOY:HDFS:JournalNode[node02]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924745',
									StepName: 'DEPLOY:HDFS:JournalNode[node02]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806679924746',
									StepName: 'DEPLOY:HDFS:JournalNode[node02]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924747',
									StepName: 'DEPLOY:HDFS:JournalNode[node02]:部署后启动 JournalNode',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924757',
									StepName: 'DEPLOY:HDFS:NameNode2[node02]:待命 NameNode2',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924758',
									StepName: 'DEPLOY:HDFS:NameNode2[node02]:部署后启动 NameNode2',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924763',
									StepName: 'DEPLOY:HDFS:ZKFailoverController2[node02]:部署后启动 ZKFailoverController2',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924767',
									StepName: 'DEPLOY:HDFS:DataNode[node02]:部署后启动 DataNode',
									StepExecState: 'RUNNING'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924773',
									StepName: 'DEPLOY:HDFS:HttpFS[node02]:部署后启动 HttpFS',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806679924777',
									StepName: 'DEPLOY:HDFS:HDFSClient[node02]:正在完成 Client 部署',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806705090563',
									StepName: 'DEPLOY:YARN:ResourceManager2[node02]:清理过期的部署环境',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806705090564',
									StepName: 'DEPLOY:YARN:ResourceManager2[node02]:初始化部署服务所需的环境',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806705090565',
									StepName: 'DEPLOY:YARN:ResourceManager2[node02]:初始化服务配置文件',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806705090566',
									StepName: 'DEPLOY:YARN:ResourceManager2[node02]:部署后启动 ResourceManage2',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806705090570',
									StepName: 'DEPLOY:YARN:NodeManager[node02]:部署后启动 NodeManager',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806705090583',
									StepName: 'DEPLOY:YARN:YARNClient[node02]:正在完成 Client 部署',
									StepExecState: 'SUSPEND'
								}
							]
						},
						{
							NodeId: '1749625291086360578',
							Hostname: 'node03',
							NodeIp: '192.168.137.12',
							ExecTotal: '20',
							ExecCurrent: '13',
							ExecProgress: '65',
							ExecProgressStepList: [
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806650564625',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node03]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806650564626',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node03]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806650564627',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node03]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806650564628',
									StepName: 'DEPLOY:MONITOR:NodeExporter[node03]:部署后启动 NodeExporter',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806671536141',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node03]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806671536142',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node03]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806671536143',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node03]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806671536144',
									StepName: 'DEPLOY:ZOOKEEPER:QuarumPeermain[node03]:部署后启动 QuarumPeermain',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806671536150',
									StepName: 'DEPLOY:ZOOKEEPER:ZookeeperClient[node03]:正在完成 Client 部署',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924749',
									StepName: 'DEPLOY:HDFS:JournalNode[node03]:清理过期的部署环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806679924750',
									StepName: 'DEPLOY:HDFS:JournalNode[node03]:初始化部署服务所需的环境',
									StepExecState: 'OK'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806679924751',
									StepName: 'DEPLOY:HDFS:JournalNode[node03]:初始化服务配置文件',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924752',
									StepName: 'DEPLOY:HDFS:JournalNode[node03]:部署后启动 JournalNode',
									StepExecState: 'OK'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806679924769',
									StepName: 'DEPLOY:HDFS:DataNode[node03]:部署后启动 DataNode',
									StepExecState: 'RUNNING'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806679924779',
									StepName: 'DEPLOY:HDFS:HDFSClient[node03]:正在完成 Client 部署',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806705090572',
									StepName: 'DEPLOY:YARN:NodeManager[node03]:清理过期的部署环境',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMON_SCRIPT',
									StepId: '1749668806705090573',
									StepName: 'DEPLOY:YARN:NodeManager[node03]:初始化部署服务所需的环境',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'JAR',
									StepId: '1749668806705090574',
									StepName: 'DEPLOY:YARN:NodeManager[node03]:初始化服务配置文件',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'SCRIPT',
									StepId: '1749668806705090575',
									StepName: 'DEPLOY:YARN:NodeManager[node03]:部署后启动 NodeManager',
									StepExecState: 'SUSPEND'
								},
								{
									StepType: 'COMMAND',
									StepId: '1749668806705090585',
									StepName: 'DEPLOY:YARN:YARNClient[node03]:正在完成 Client 部署',
									StepExecState: 'SUSPEND'
								}
							]
						}
					]
				}
			}
		};
		const {
			// @ts-ignore
			Data: {
				JobExecProgress: { ExecProgressPerNodeList }
			}
		} = progressData;
		return ExecProgressPerNodeList;
	};

	const tableData = usePolling(getSpeed, stableState, 1000);
	return (
		<Table
			rowSelection={{
				...rowSelection
			}}
			rowKey="NodeId"
			columns={columns}
			dataSource={tableData}
		/>
	);
});
export default DeployStep;
