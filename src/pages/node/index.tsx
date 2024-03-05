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
 * 节点管理列表页
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, Select, Flex, Space, App, message, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';
import useStore from '@/store/store';
import ItemConfigInfo from '@/components/itemConfigInfo';
import { updateCurrentView } from '@/utils/helper';
import { NodeType, NodeWithComponent, ClusterType, BadgeStatus } from '@/api/interface';

const ManageList: React.FC = () => {
	const { t } = useTranslation();
	const { stateText } = useStore();
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	const [selectData, setSelectData] = useState([]);
	const [selectCluster, setSelectCluster] = useState('');
	const [selectedRowsList, setSelectedRowsList] = useState<NodeType[]>([]);
	const { navigateToAddNode } = useNavigater();
	const [removeDisabled, setRemoveDisabled] = useState(true); // 是否禁用批量删除
	const [messageApi, contextHolder] = message.useMessage();
	const { modal } = App.useApp();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('node.addNode'),
			callback: () => navigateToAddNode(selectCluster),
			disabled: !selectData.length
		},
		{
			id: 2,
			label: t('node.batchRestart'),
			callback: () => {
				const nodeList = selectedRowsList.map(node => ({ NodeId: node.NodeId, Hostname: node.Hostname }));
				const sshPort = selectedRowsList[0].SshPort;
				restartNode(nodeList, sshPort);
			},
			disabled: selectedRowsList.length === 0
		},
		{
			id: 3,
			label: t('node.batchRemove'),
			callback: () => removeNode(selectedRowsList.map(node => ({ NodeId: node.NodeId }))),
			disabled: removeDisabled
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = (text: [], record: NodeType) => {
		const { NodeId, Hostname, SshPort } = record;
		return [
			{
				id: 1,
				label: t('node.restart'),
				callback: () => restartNode([{ NodeId, Hostname }], SshPort),
				disabled: false
			},
			{
				id: 2,
				label: t('node.remove'),
				callback: () => removeNode([{ NodeId }]),
				disabled: text.length !== 0
			}
		];
	};
	const columns: ColumnsType<NodeType> = [
		{
			title: t('node.name'),
			dataIndex: 'Hostname',
			key: 'Hostname'
		},
		{
			title: t('node.ip'),
			dataIndex: 'NodeIp',
			key: 'NodeIp'
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			key: 'CpuCores',
			render: (text: string, record) => <ItemConfigInfo text={text} record={record} />
		},
		{
			title: t('node.state'),
			dataIndex: 'NodeState',
			key: 'NodeState',
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		},
		{
			title: t('node.component'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: text => text.length
		},
		{
			title: t('operation'),
			key: 'ComponentName',
			dataIndex: 'ComponentName',
			render: (text, record) => {
				return (
					<Space>
						{buttonConfigItem(text, record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
	];
	const restartNode = (nodeList: object[], sshPort: string | number) => {
		modal.confirm({
			title: t('node.restart'),
			content: t('node.restartConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.operateNode;
				const params = {
					ClusterId: selectCluster,
					NodeActionTypeEnum: 'RESTART',
					NodeInfoList: nodeList,
					SshPort: sshPort
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getNodeList(selectCluster);
				}
			}
		});
	};
	const removeNode = (nodeIdList: object[]) => {
		modal.confirm({
			title: t('node.remove'),
			content: t('node.removeConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.removeNode;
				const params = {
					ClusterId: selectCluster,
					NodeIdList: nodeIdList
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getNodeList(selectCluster);
				}
			}
		});
	};
	const getClusterList = async () => {
		setLoading(true);
		const api = APIConfig.getClusterList;
		const data = await RequestHttp.get(api);
		const {
			Data: { ClusterList }
		} = data;
		const listData = ClusterList.map((item: ClusterType) => {
			return {
				value: item.ClusterId,
				label: item.ClusterName
			};
		});
		setLoading(false);
		setSelectData(listData);

		const currentViewCluster = ClusterList.find((cluster: ClusterType) => cluster.IsCurrentView === true);
		if (currentViewCluster) {
			// 如果找到了，设置setSelectCluster为该项的ClusterId
			setSelectCluster(currentViewCluster.ClusterId);
		} else {
			// 如果没有找到，则使用第一项的ClusterId
			ClusterList.length > 0 ? setSelectCluster(ClusterList[0].ClusterId) : setSelectCluster(''); // 确保数组不为空
		}
	};
	const getNodeList = async (id: string | number) => {
		const api = APIConfig.nodeListWithComponent;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		const {
			Data: { NodeWithComponentList }
		} = data;
		const listData = NodeWithComponentList.map((node: NodeWithComponent) => {
			node.NodeDetail.ComponentName = node.ComponentName;
			return node.NodeDetail;
		});
		setTableData(listData);
	};
	const handleChange = async (value: string) => {
		await updateCurrentView(value);
		setSelectCluster(value);
	};
	useEffect(() => {
		selectCluster && getNodeList(selectCluster);
	}, [selectCluster]);
	useEffect(() => {
		// 检查 ComponentName 数组是否为空
		const isButtonAbled = selectedRowsList.length > 0 && selectedRowsList.every(item => item.ComponentName.length === 0);
		// 更新按钮的禁用状态
		setRemoveDisabled(!isButtonAbled);
	}, [selectedRowsList]); // 在 selectedRowsList 变化时触发

	useEffect(() => {
		getClusterList();
	}, []);
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
			setSelectedRowsList(selectedRows);
		}
	};

	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			{contextHolder}
			<Flex justify="space-between">
				<Space>
					{buttonConfigTop.map(button => (
						<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
							{button.label}
						</Button>
					))}
				</Space>
				<div>
					{t('node.currentCluster')}
					<Select className="w-[200px]" options={selectData} value={selectCluster} onChange={handleChange} />
				</div>
			</Flex>
			<Table
				className="mt-[20px]"
				rowKey="NodeId"
				rowSelection={{
					...rowSelection
				}}
				columns={columns}
				dataSource={tableData}
				loading={loading}
			/>
		</Card>
	);
};

export default ManageList;
