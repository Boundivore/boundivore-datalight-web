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
 * 服务管理列表页
 * @author Tracy
 */
import { FC, Key, useState, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Table, Button, Flex, Space, App, Badge, message, Dropdown, Modal } from 'antd';
import type { TableColumnsType, MenuProps, TableProps } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import usePolling from '@/hooks/usePolling';
import useNavigater from '@/hooks/useNavigater';
import { ServiceItemType, BadgeStatus, ComponentWebUI } from '@/api/interface';
import useStore from '@/store/store';
import ViewActiveJobModal from '@/components/viewActiveJobModal';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import ContainerCard from '@/components/containerCard';
type TableRowSelection<T> = TableProps<T>['rowSelection'];

const stateArray = ['SELECTED', 'UNSELECTED', 'REMOVED'];
const ServiceManage: FC = () => {
	const { t } = useTranslation();
	const { stateText, setJobId } = useStore();
	const [selectService, setSelectService] = useState<ServiceItemType[]>([]);
	const [allowAdd, setAllowAdd] = useState(false); // 是否允许新增服务操作,默认不允许
	const [startDisabled, setStartDisabled] = useState(true); // 是否禁用批量启动, 默认处于禁用状态
	// const [stopDisabled, setStopDisabled] = useState(false); // 是否禁用批量停止
	const [isActiveJobModalOpen, setIsActiveJobModalOpen] = useState(false);
	const { navigateToComManage, navigateToConfig, navigateToAddComponent, navigateToWebUI, navigateToNodeInit } = useNavigater();
	const { clusterComponent, selectCluster } = useCurrentCluster(setAllowAdd);
	const [dropDownItems, setDropDownItems] = useState<MenuProps['items']>([]);
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('service.addService'),
			callback: () => addService(),
			disabled: false
		},
		{
			id: 2,
			label: t('service.startService'),
			callback: () => operateComponent('START'),
			disabled: startDisabled
		},
		{
			id: 3,
			label: t('service.stopService'),
			callback: () => operateComponent('STOP'),
			disabled: startDisabled
		},
		{
			id: 4,
			label: t('service.restartService'),
			callback: () => operateComponent('RESTART'),
			disabled: startDisabled
		},
		{
			id: 5,
			label: t('rollingRestart'),
			callback: () => operateComponent('RESTART', true), //滚动重启，第二个参数为true
			disabled: startDisabled
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = (record: ServiceItemType) => {
		const { ServiceName } = record;
		let buttonConfigArr = [
			{
				id: 1,
				label: t('modifyConfig'),
				callback: () => navigateToConfig(selectCluster, ServiceName),
				disabled: stateArray.includes(record?.SCStateEnum)
			},
			{
				id: 2,
				label: t('service.componentManage'),
				callback: () => navigateToComManage(selectCluster, ServiceName),
				// disabled: !record.ComponentNodeList || record.ComponentNodeList.length === 0
				disabled: stateArray.includes(record?.SCStateEnum)
			},
			{
				id: 3,
				label: t('service.ui'),
				callback: async () => {
					const items = await navigateToWebUI(selectCluster, ServiceName);
					const transformedData = items.length
						? items.map((item: ComponentWebUI) => ({
								key: item.ComponentName,
								label: (
									<a target="_blank" href={item.Url}>
										{item.ShowName}
									</a>
								)
						  }))
						: [
								{
									key: 1,
									label: t('noUI')
								}
						  ];
					setDropDownItems(transformedData);
				},
				type: 'dropDown',
				disabled: stateArray.includes(record?.SCStateEnum)
			}
		];
		if (ServiceName === 'MONITOR') {
			buttonConfigArr.push({
				id: 4,
				label: t('resetPrometheus'),
				callback: resetPrometheus,
				disabled: stateArray.includes(record?.SCStateEnum)
			});
		}
		return buttonConfigArr;
	};
	const columns: TableColumnsType<ServiceItemType> = [
		{
			title: t('service.serviceName'),
			dataIndex: 'ServiceName',
			key: 'ServiceName',
			render: text => (
				<div className="flex items-center">
					<img src={`/service_logo/${text.toLowerCase()}.svg`} width="16" height="16" />
					<span className="pl-[5px]">{text}</span>
				</div>
			)
		},
		{
			title: t('service.serviceType'),
			dataIndex: 'ServiceType',
			key: 'ServiceType',
			render: text => t(text.toLowerCase()),
			filters: [
				{
					text: t('base'),
					value: 'BASE'
				},
				{
					text: t('storage'),
					value: 'STORAGE'
				},
				{
					text: t('compute'),
					value: 'COMPUTE'
				}
			],
			onFilter: (value: any, record) => record.ServiceType.indexOf(value) === 0
		},
		{
			title: t('description'),
			dataIndex: 'Desc',
			key: 'Desc'
		},
		{
			title: t('state'),
			dataIndex: 'SCStateEnum',
			key: 'SCStateEnum',
			render: (text: string) => {
				const stateMachine = (currentState: string) => {
					// 在这里，我们可以添加更复杂的逻辑来处理状态转换
					// 但由于题目要求不论输入什么状态都返回'UNDEPLOYED'，所以直接返回即可
					if (stateArray.includes(currentState)) {
						return 'UNDEPLOYED';
					} else {
						return currentState;
					}
				};

				const outputState = stateMachine(text);
				return <Badge status={stateText[outputState].status as BadgeStatus} text={t(stateText[outputState].label)} />;
			},
			filters: [
				{
					text: t('service.undeployed'),
					// 这里与antd中ColumnFilterItem无法保持一致，用any兼容
					value: stateArray as any
				},
				{
					text: t('service.changing'),
					value: 'CHANGING'
				},
				{
					text: t('service.deployed'),
					value: 'DEPLOYED'
				}
			],
			onFilter: (value, record) => {
				if (Array.isArray(value)) {
					// 如果value是数组，检查record中的值是否存在于数组中
					return value.includes(record.SCStateEnum);
				} else {
					// 如果value不是数组，进行常规比较
					return record.SCStateEnum === value;
				}
			}
		},
		{
			title: t('operation'),
			key: 'detail',
			dataIndex: 'detail',
			render: (_text, record) => {
				return (
					<Space>
						{buttonConfigItem(record).map(button =>
							button.type === 'dropDown' ? (
								<Dropdown
									key={button.id}
									menu={{ items: dropDownItems }}
									placement="bottomLeft"
									trigger={['click']}
									disabled={button.disabled}
								>
									<Button type="primary" size="small" ghost onClick={button.callback}>
										{button.label}
									</Button>
								</Dropdown>
							) : (
								<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
									{button.label}
								</Button>
							)
						)}
					</Space>
				);
			}
		}
	];
	const resetPrometheus = async () => {
		const api = APIConfig.resetPrometheus;
		const params = { ClusterId: selectCluster };
		const { Code } = await RequestHttp.get(api, { params });
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
		}
	};

	const viewActiveJob = async () => {
		const apiList = APIConfig.getActiveJobId;
		const data = await RequestHttp.get(apiList);
		const {
			Data: { ClusterId, JobId }
		} = data;
		setJobId(JobId);
		selectCluster === ClusterId
			? setIsActiveJobModalOpen(true)
			: modal.info({
					title: t('noActiveJob')
			  });
	};
	const handleModalOk = () => {
		setIsActiveJobModalOpen(false);
	};
	const addService = () => {
		if (allowAdd) {
			navigateToAddComponent(selectCluster);
		} else {
			modal.info({
				title: (
					<Trans i18nKey="continueBoot">
						This should be a{' '}
						<a
							onClick={() => {
								Modal.destroyAll();
								navigateToNodeInit(selectCluster);
							}}
						>
							link
						</a>
					</Trans>
				)
			});
		}
	};
	const operateComponent = (operation: string, isOneByOne: boolean = false) => {
		modal.confirm({
			title: t(operation.toLowerCase()),
			content: t('operationServiceConfirm', { operation: t(operation.toLowerCase()) }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.operateJob;
				const params = {
					ActionTypeEnum: operation,
					ClusterId: selectCluster,
					IsOneByOne: isOneByOne,
					ServiceNameList: selectService.map(service => service.ServiceName)
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					viewActiveJob();
					// getComponentList();
				}
			}
		});
	};

	const getServiceList = async () => {
		const api = APIConfig.serviceList;
		const data = await RequestHttp.get(api, { params: { ClusterId: selectCluster } });
		const {
			Data: { ServiceSummaryList }
		} = data;
		return ServiceSummaryList;
		// setTableData(ServiceSummaryList);
	};

	const tableData: ServiceItemType[] = usePolling(getServiceList, [], 1000, [selectCluster]);

	useEffect(() => {
		// 	// 检查所有组件是否都处于'STOPPED'状态
		// 	// const allStopped = selectService.length > 0 && selectService.every(item => item.SCStateEnum === 'STOPPED');

		// 	// 更新按钮的禁用状态
		setStartDisabled(selectService.length === 0 || selectService.some(item => stateArray.includes(item.SCStateEnum)));
		// 	setStopDisabled(false); // 如果全是'STOPPED'，则停止按钮禁用
	}, [selectService]);
	const rowSelection: TableRowSelection<ServiceItemType> = {
		onChange: (_selectedRowKeys: Key[], selectedRows: ServiceItemType[]) => {
			// const filteredselectedRows = selectedRows.filter(item => item.ComponentId);
			setSelectService(selectedRows);
		},
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
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
					{clusterComponent}
				</Flex>
				<h4>{t('totalItems', { total: tableData.length, selected: selectService.length })}</h4>
				<Table
					rowSelection={{
						...rowSelection
					}}
					className="mt-[20px]"
					rowKey="ServiceName"
					columns={columns}
					dataSource={tableData}
					pagination={{
						showSizeChanger: true,
						total: tableData.length,
						showTotal: total => t('totalItems', { total, selected: selectService.length })
					}}
				/>
			</ContainerCard>
			{isActiveJobModalOpen ? (
				<ViewActiveJobModal isModalOpen={isActiveJobModalOpen} handleCancel={handleModalOk} type="jobProgress" />
			) : null}
		</>
	);
};

export default ServiceManage;
