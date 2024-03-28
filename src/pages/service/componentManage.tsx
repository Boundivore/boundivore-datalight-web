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
 * 组件管理列表页
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Card, Space, App, message, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';
import usePolling from '@/hooks/usePolling';
import JobPlanModal from '@/components/jobPlanModal';
import ViewActivrJobModal from '@/components/viewActiveJobModal';
import { ComponentSummaryVo, ComponentNodeVo } from '@/api/interface';

const { Text } = Typography;

interface DataType extends ComponentNodeVo {
	ComponentName: string;
	ComponentNodeList: {
		ComponentId: string;
	}[];
	operation: boolean;
}

const ComponentManage: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const serviceName = searchParams.get('name') || '';
	// const [loading, setLoading] = useState(false);
	const [selectComponent, setSelectComponent] = useState<DataType[]>([]);
	const [defaultExpandedRowKeys, setDefaultExpandedRowKeys] = useState<string[]>([]);
	const [removeDisabled, setRemoveDisabled] = useState(true); // 是否禁用批量删除
	const [startDisabled, setStartDisabled] = useState(true); // 是否禁用批量启动
	const [stopDisabled, setStopDisabled] = useState(true); // 是否禁用批量停止
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isActiveJobModalOpen, setIsActiveJobModalOpen] = useState(false);
	const { navigateToAddComponent } = useNavigater();
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('service.addComponent'),
			callback: () => navigateToAddComponent(id, serviceName),
			disabled: false
		},
		{
			id: 2,
			label: t('start'),
			callback: () => operateComponent('START', selectComponent),
			disabled: startDisabled
		},
		{
			id: 3,
			label: t('stop'),
			callback: () => operateComponent('STOP', selectComponent),
			disabled: stopDisabled
		},
		{
			id: 4,
			label: t('restart'),
			callback: () => operateComponent('RESTART', selectComponent),
			disabled: selectComponent.length === 0
		},
		{
			id: 5,
			label: t('remove'),
			callback: () => removeComponent(selectComponent),
			disabled: removeDisabled
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = (record: DataType) => {
		// const { NodeId, Hostname, SshPort } = record;
		return [
			{
				id: 1,
				label: t('start'),
				callback: () => operateComponent('START', [record]),
				disabled: record.SCStateEnum === 'STARTED'
			},
			{
				id: 2,
				label: t('stop'),
				callback: () => operateComponent('STOP', [record]),
				disabled: record.SCStateEnum === 'STOPPED' || record.SCStateEnum === 'STOPPING'
			},
			{
				id: 3,
				label: t('restart'),
				callback: () => operateComponent('RESTART', [record]),
				disabled: record.SCStateEnum === 'STOPPING'
			},
			{
				id: 4,
				label: t('remove'),
				callback: () => removeComponent([record]),
				disabled: record.SCStateEnum !== 'STOPPED'
			}
		];
	};
	useEffect(() => {
		// 检查所有组件是否都处于'STOPPED'状态
		const allStopped = selectComponent.length > 0 && selectComponent.every(item => item.SCStateEnum === 'STOPPED');
		const stopAbled = selectComponent.length > 0 && selectComponent.every(item => item.SCStateEnum !== 'STOPPED');

		// 更新按钮的禁用状态
		setStartDisabled(!allStopped); // 如果不全是'STOPPED'，则开始按钮禁用
		setStopDisabled(!stopAbled); // 如果全是'STOPPED'，则停止按钮禁用
		setRemoveDisabled(!allStopped); // 如果不全是'STOPPED'，则移除按钮禁用
	}, [selectComponent]); // 在 selectComponent 变化时触发
	const columns: ColumnsType<DataType> = [
		{
			title: t('service.componentName'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: (text, record) => {
				// record.operation ? null : (return { text });
				if (!record.operation) {
					return <span>{text}</span>;
				}
			}
		},
		{
			title: t('service.node'),
			dataIndex: 'Hostname',
			key: 'Hostname',
			render: text => {
				return <Text ellipsis={true}>{text}</Text>;
			}
		},
		{
			title: t('service.componentState'),
			dataIndex: 'SCStateEnum',
			key: 'SCStateEnum',
			render: (text: string) => text && t(text.toLowerCase())
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
			render: (text, record) => {
				return text ? (
					<Space>
						{buttonConfigItem(record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				) : null;
			}
		}
	];
	const removeComponent = (componentList: DataType[]) => {
		const idList = componentList.map(component => ({
			ComponentId: component.ComponentId
		}));
		modal.confirm({
			title: t('remove'),
			content: t('operationConfirm', { operation: t('remove') }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.removeComponent;
				const params = {
					ClusterId: id,
					ComponentIdList: idList,
					ServiceName: serviceName
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getComponentList();
				}
			}
		});
	};
	const operateComponent = (operation: string, componentList: DataType[]) => {
		const jobDetailComponentList = componentList.map(component => {
			const jobDetailNodeList = [
				{
					Hostname: component.Hostname,
					NodeId: component.NodeId,
					NodeIp: component.NodeIp
				}
			];

			return {
				ComponentName: component.ComponentName,
				JobDetailNodeList: jobDetailNodeList
			};
		});
		modal.confirm({
			title: t(operation.toLowerCase()),
			content: t('operationConfirm', { operation: t(operation.toLowerCase()) }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.operateService;
				const params = {
					ActionTypeEnum: operation,
					ClusterId: id,
					IsOneByOne: false,
					JobDetailServiceList: [
						{
							JobDetailComponentList: jobDetailComponentList,
							ServiceName: serviceName
						}
					]
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					operation === 'RESTART' && setIsModalOpen(true);
					// getComponentList(); // 这里不用调接口了，轮询替代了
				}
			}
		});
	};
	const viewActiveJob = async () => {
		const apiList = APIConfig.getActiveJobId;
		const data = await RequestHttp.get(apiList);
		const {
			Data: { ClusterId, NodeJobId }
		} = data;
		console.log('ClusterId', ClusterId);
		console.log('NodeJobId', NodeJobId);
		id === ClusterId
			? setIsActiveJobModalOpen(true)
			: modal.info({
					title: '当前没有活跃的任务'
			  });
		// ? setIsActiveJobModalOpen(true)
		// : modal.info({
		// 		title: '当前没有活跃的任务'
		//   });
	};
	const handleModalOk = () => {
		setIsModalOpen(false);
	};
	const getComponentList = async () => {
		// setLoading(true);
		const api = APIConfig.componentListByServiceName;
		const params = { ClusterId: id, ServiceName: serviceName };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ServiceComponentSummaryList }
		} = data;
		const tempData = ServiceComponentSummaryList[0].ComponentSummaryList.map((item: ComponentSummaryVo) => {
			item.ComponentNodeList.map(child => ({
				operation: true,
				rowKey: child.ComponentId,
				ComponentName: item.ComponentName
			}));
			return {
				...item,
				rowKey: item.ComponentName,
				children: item.ComponentNodeList
			};
		});
		// setLoading(false);
		return tempData;
		// setTableData(tempData);
	};
	const tableData = usePolling(getComponentList, [], 1000, [serviceName]);

	useEffect(() => {
		const expandedRowKeys: string[] = [];
		tableData.map((data: DataType) => {
			expandedRowKeys.push(data.ComponentName);
		});
		setDefaultExpandedRowKeys(expandedRowKeys);
	}, [tableData]);
	const rowSelection = {
		checkStrictly: false,
		onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			const filteredselectedRows = selectedRows.filter(item => item.ComponentId);
			setSelectComponent(filteredselectedRows);
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
						<Button type="primary" onClick={viewActiveJob}>
							{t('viewActiveJob')}
						</Button>
					</Space>
				</Flex>
				<Table
					rowSelection={{
						...rowSelection
					}}
					className="mt-[20px]"
					rowKey="rowKey"
					columns={columns}
					dataSource={tableData}
					expandable={{ expandedRowKeys: defaultExpandedRowKeys }}
				/>
			</Card>
			{isActiveJobModalOpen ? (
				<ViewActivrJobModal isModalOpen={isModalOpen} handleOk={handleModalOk} handleCancel={handleModalOk} />
			) : null}
			{isModalOpen ? <JobPlanModal isModalOpen={isModalOpen} handleOk={handleModalOk} type="jobPlan" /> : null}
		</>
	);
};

export default ComponentManage;
