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
import { FC, useEffect, useState, Key } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, Select, Flex, Space, App, message, Badge } from 'antd';
import type { TableColumnsType, SelectProps } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';
import usePolling from '@/hooks/usePolling';
import useStore from '@/store/store';
import ItemConfigInfo from '@/components/itemConfigInfo';
import ViewActiveJobModal from '@/components/viewActiveJobModal';
import { updateCurrentView } from '@/utils/helper';
import JobPlanModal from '@/components/jobPlanModal';
import { NodeType, NodeWithComponent, ClusterType, BadgeStatus } from '@/api/interface';

const ManageList: FC = () => {
	const { t } = useTranslation();
	const { stateText } = useStore();
	const [loading, setLoading] = useState(false);
	const [selectData, setSelectData] = useState<SelectProps['options']>([]);
	const [selectCluster, setSelectCluster] = useState<string>('');
	const [selectedRowsList, setSelectedRowsList] = useState<NodeType[]>([]);
	const [allowAdd, setAllowAdd] = useState(false); // 是否允许新增节点操作,默认不允许
	const { navigateToAddNode } = useNavigater();
	const [removeDisabled, setRemoveDisabled] = useState(true); // 是否禁用批量删除
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isActiveJobModalOpen, setIsActiveJobModalOpen] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();
	const { modal } = App.useApp();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('node.addNode'),
			callback: () => addNode(),
			disabled: !selectData!.length
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
	const columns: TableColumnsType<NodeType> = [
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
	const addNode = () => {
		if (allowAdd) {
			navigateToAddNode(selectCluster);
		} else {
			modal.info({
				title: '当前不支持新增节点操作'
			});
		}
	};
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
					// setIsModalOpen(true); // 暂时先不展示
					// getNodeList(); // 这里不用调接口了，轮询替代了
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
				}
			}
		});
	};
	// const viewActiveJob = async () => {
	// 	const apiList = APIConfig.getActiveNodeJobId;
	// 	const data = await RequestHttp.get(apiList);
	// 	const {
	// 		Data: { ClusterId, NodeJobId }
	// 	} = data;
	// 	setJobNodeId(NodeJobId);
	// 	console.log('NodeJobId', NodeJobId);
	// 	selectCluster === ClusterId
	// 		? setIsActiveJobModalOpen(true)
	// 		: modal.info({
	// 				title: '当前没有活跃的任务'
	// 		  });
	// };
	const getClusterList = async () => {
		setLoading(true);
		const api = APIConfig.getClusterList;
		const data = await RequestHttp.get(api);
		const clusterList: ClusterType[] = data.Data.ClusterList;
		const listData = clusterList.map(item => ({
			value: item.ClusterId,
			label: item.ClusterName,
			hasAlreadyNode: item.HasAlreadyNode
		}));
		setLoading(false);
		setSelectData(listData);

		const currentViewCluster = clusterList.find(cluster => cluster.IsCurrentView === true);
		if (currentViewCluster) {
			// 如果找到了，设置setSelectCluster为该项的ClusterId
			setSelectCluster(currentViewCluster.ClusterId);
			setAllowAdd(!currentViewCluster.HasAlreadyNode);
		} else {
			// 如果没有找到，则使用第一项的ClusterId
			clusterList.length > 0 ? setSelectCluster(clusterList[0].ClusterId) : setSelectCluster(''); // 确保数组不为空
			clusterList.length > 0 ? setAllowAdd(!clusterList[0].HasAlreadyNode) : setAllowAdd(false); // 确保数组不为空
		}
	};
	const getNodeList = async () => {
		const api = APIConfig.nodeListWithComponent;
		const data = await RequestHttp.get(api, { params: { ClusterId: selectCluster } });
		const {
			Data: { NodeWithComponentList }
		} = data;
		const listData = NodeWithComponentList.map((node: NodeWithComponent) => {
			node.NodeDetail.ComponentName = node.ComponentName;
			return node.NodeDetail;
		});
		return listData;
		// setTableData(listData);
	};
	const handleChange = async (value: string, option: DefaultOptionType | DefaultOptionType[]) => {
		await updateCurrentView(value);
		setSelectCluster(value);
		if (Array.isArray(option)) {
			// 如果 option 是数组，则处理数组中的第一个元素
			setAllowAdd(!option[0].hasAlreadyNode);
		} else {
			// 如果 option 不是数组，则直接处理
			setAllowAdd(!option.hasAlreadyNode);
		}
	};
	const handleModalOk = () => {
		setIsModalOpen(false);
	};
	const handleModalCancel = () => {
		setIsActiveJobModalOpen(false);
	};
	const tableData: NodeType[] = usePolling(getNodeList, [], 1000, [selectCluster]);

	// useEffect(() => {
	// 	selectCluster && getNodeList(selectCluster);
	// }, [selectCluster]);
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
		onChange: (_selectedRowKeys: Key[], selectedRows: NodeType[]) => {
			setSelectedRowsList(selectedRows);
		}
	};

	return (
		<>
			<Card className="min-h-[calc(100%-50px)] m-[20px]">
				{contextHolder}
				<Flex justify="space-between">
					<Space>
						{buttonConfigTop.map(button => (
							<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
					<Space>
						<>
							{t('node.currentCluster')}
							<Select className="w-[200px]" options={selectData} value={selectCluster} onChange={handleChange} />
						</>
						{/* <Button type="primary" onClick={viewActiveJob}>
							{t('viewActiveJob')}
						</Button> */}
					</Space>
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
			{isActiveJobModalOpen ? (
				<ViewActiveJobModal isModalOpen={isModalOpen} handleCancel={handleModalCancel} type="nodeJobProgress" />
			) : null}
			{isModalOpen ? <JobPlanModal isModalOpen={isModalOpen} handleOk={handleModalOk} /> : null}
		</>
	);
};

export default ManageList;
