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
 * @author Tracy
 */
import { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Card, Space, App, message, Typography, Flex, Row, Col, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';
import usePolling from '@/hooks/usePolling';
import useStore from '@/store/store';
import ViewActiveJobModal from '@/components/viewActiveJobModal';
import { ComponentSummaryVo, ComponentNodeVo, BadgeStatus } from '@/api/interface';
import ContainerCard from '@/components/containerCard';

const { Text } = Typography;

interface DataType extends ComponentNodeVo {
	ComponentName: string;
	// ComponentNodeList: {
	// 	ComponentId: string;
	// }[];
	operation: boolean;
}

const ComponentManage: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const serviceName = searchParams.get('name') || '';
	// const [loading, setLoading] = useState(false);
	const [componentTable, setComponentTable] = useState<DataType[]>([]);
	const [activeComponent, setActiveComponent] = useState('');
	const [selectComponent, setSelectComponent] = useState<DataType[]>([]);
	const [componentWithNode, setComponentWithNode] = useState({});
	const [removeDisabled, setRemoveDisabled] = useState(true); // 是否禁用批量删除
	const [startDisabled, setStartDisabled] = useState(true); // 是否禁用批量启动
	const [stopDisabled, setStopDisabled] = useState(true); // 是否禁用批量停止
	// const [isModalOpen, setIsModalOpen] = useState(false);
	const [isActiveJobModalOpen, setIsActiveJobModalOpen] = useState(false);
	const [handleButton, setHandleButton] = useState(false);
	const { setJobId, stateText } = useStore();
	const { navigateToAddComponent, navigateToService } = useNavigater();
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	const activeComponentRef = useRef(activeComponent);
	const selectComponentRef = useRef(selectComponent);

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
	}, [selectComponent, handleButton]); // 在 selectComponent 变化时触发
	const componentColumns: ColumnsType<DataType> = [
		{
			title: t('service.componentName'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: text => <span>{text}</span>
		},
		{
			title: '已选节点数',
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			// render: (text, record) => <Badge status="processing" count={record.num} showZero style={{ backgroundColor: '#51c2fe' }} />
			render: (_text, record) => record.num
		}
	];
	const columns: ColumnsType<DataType> = [
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
			// render: (text: string) => text && t(text.toLowerCase())
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
			render: (_text, record) => {
				return (
					<Space>
						{buttonConfigItem(record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
	];
	const removeComponent = (componentList: DataType[]) => {
		const idList = componentList.map(component => ({
			ComponentId: component.ComponentId
		}));
		modal.confirm({
			title: t('remove'),
			content: t('operationConfirm', { operation: t('remove'), number: componentList.length }),
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
				const {
					Code,
					Data: {
						ServiceExist: { IsServiceExistComponent }
					}
				} = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					IsServiceExistComponent ? getComponentList() : navigateToService();
					setHandleButton(!handleButton);
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
			content: t('operationConfirm', { operation: t(operation.toLowerCase()), number: componentList.length }),
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
					viewActiveJob();
					setHandleButton(!handleButton);
					// operation === 'RESTART' && setIsModalOpen(true);
					// getComponentList(); // 这里不用调接口了，轮询替代了
				}
			}
		});
	};
	const viewActiveJob = async () => {
		const apiList = APIConfig.getActiveJobId;
		const data = await RequestHttp.get(apiList);
		const {
			Data: { ClusterId, JobId }
		} = data;
		setJobId(JobId);
		id === ClusterId
			? setIsActiveJobModalOpen(true)
			: modal.info({
					title: '当前没有活跃的任务'
			  });
	};
	const handleModalOk = () => {
		setIsActiveJobModalOpen(false);
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
			const componentNodeList = item.ComponentNodeList.map(child => ({
				...child,
				ComponentName: item.ComponentName,
				rowKey: `${child.ComponentId}_${child.NodeId}`
			}));
			const intersectionByIdList = _.intersectionBy(componentNodeList, selectComponentRef.current, 'ComponentId');
			return {
				...item,
				num: intersectionByIdList.filter(component => item.ComponentName === component.ComponentName).length,
				ComponentNodeList: componentNodeList
			};
		});
		setComponentTable(tempData);
		if (!activeComponentRef.current) {
			setActiveComponent(ServiceComponentSummaryList[0].ComponentSummaryList[0].ComponentName);
		}
		// setLoading(false);
		return tempData;
	};
	usePolling(getComponentList, [], 1000, [serviceName]);

	useEffect(() => {
		selectComponentRef.current = selectComponent;
	}, [selectComponent]);
	useEffect(() => {
		activeComponentRef.current = activeComponent;
	}, [activeComponent]);

	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setComponentWithNode({ ...componentWithNode, ...{ [activeComponent]: selectedRows } });
			const mergedArray: DataType[] = Object.values({
				...componentWithNode,
				...{ [activeComponent]: selectedRows }
			}).flat() as DataType[];
			setSelectComponent(mergedArray);
		},
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
	};
	const rowClassName = (record: DataType) => {
		return activeComponent === record.ComponentName ? 'bg-[#f0fcff]' : '';
	};
	return (
		<>
			<ContainerCard>
				{contextHolder}
				<Flex justify="space-between">
					<Space>
						{buttonConfigTop.map(button => (
							<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				</Flex>
				<Row gutter={24} className="mt-[20px]">
					<Col span={6}>
						<Card className="data-light-card">
							<Table
								className="mt-[20px] cursor-pointer"
								rowKey="ComponentName"
								columns={componentColumns}
								dataSource={componentTable}
								onRow={record => {
									return {
										onClick: () => {
											setActiveComponent(record.ComponentName);
										} // 点击行
									};
								}}
								pagination={false}
								rowClassName={rowClassName}
							/>
						</Card>
					</Col>
					<Col span={18}>
						<Card className="data-light-card" title={activeComponent}>
							{componentTable.map(component => {
								const { ComponentNodeList, ComponentName } = component;
								return (
									<>
										<h4 className={`${ComponentName !== activeComponent && 'hidden'}`}>
											{t('totalItems', { total: ComponentNodeList.length, selected: selectComponent.length })}
										</h4>
										<Table
											rowSelection={{
												...rowSelection
											}}
											className={`mt-[20px] ${ComponentName !== activeComponent && 'hidden'}`}
											rowKey="rowKey"
											key={ComponentName}
											columns={columns}
											dataSource={ComponentNodeList}
											pagination={{
												showSizeChanger: true,
												total: ComponentNodeList.length,
												showTotal: total => t('totalItems', { total, selected: selectComponent.length })
											}}
										/>
									</>
								);
							})}
						</Card>
					</Col>
				</Row>
			</ContainerCard>
			{isActiveJobModalOpen ? (
				<ViewActiveJobModal isModalOpen={isActiveJobModalOpen} handleCancel={handleModalOk} type="jobProgress" />
			) : null}
			{/* {isModalOpen ? <JobPlanModal isModalOpen={isModalOpen} handleOk={handleModalOk} type="jobPlan" /> : null} */}
		</>
	);
};

export default ComponentManage;
