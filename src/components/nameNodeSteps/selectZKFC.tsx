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
 * SelectZKFC- 选择要迁移的ZKFC, 第二步
 * @author Tracy
 */
import { FC, useState, useEffect } from 'react';
import { t } from 'i18next';
import { Table, Badge, Button, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import { RowSelectionType } from 'antd/es/table/interface';
import { ComponentSummaryVo, BadgeStatus, ComponentNodeVo } from '@/api/interface';
import useStore from '@/store/store';
import useComponentOperations from '@/hooks/useComponentOperations';
import ViewActiveJobModal from '@/components/viewActiveJobModal';

interface SelectZKFCProps {
	zkfcList: ComponentSummaryVo[];
}
const serviceName = 'HDFS';
const SelectZKFC: FC<SelectZKFCProps> = ({ zkfcList }) => {
	const { stateText, setSelectedZKFC, selectedNameNode, setMigrateStep } = useStore();
	const [selectedRows, setSelectedRows] = useState<ComponentSummaryVo[]>([]);
	const [zkFailoverControllerList, setZkFailoverControllerList] = useState<ComponentSummaryVo[]>([]);
	const { removeComponent, operateComponent, isActiveJobModalOpen, handleModalOk, contextHolder } =
		useComponentOperations(serviceName);
	// 单条操作按钮配置
	const buttonConfigItem = (record: ComponentSummaryVo) => {
		// const { NodeId, Hostname, SshPort } = record;
		const { ComponentNodeList, ComponentName } = record;
		const mergeData = ComponentNodeList.map(node => ({
			...node,
			ComponentName
		}));
		return [
			{
				id: 1,
				label: t('stop'),
				callback: () => operateComponent('STOP', mergeData),
				disabled: ComponentNodeList[0].SCStateEnum === 'STOPPED' || ComponentNodeList[0].SCStateEnum === 'STOPPING'
			},
			{
				id: 2,
				label: t('remove'),
				callback: () => removeComponent(mergeData),
				disabled: ComponentNodeList[0].SCStateEnum !== 'STOPPED'
			}
		];
	};
	const columns: TableColumnsType<ComponentSummaryVo> = [
		{
			title: t('service.componentName'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: text => <span>{text}</span>
		},
		{
			title: t('service.node'),
			dataIndex: 'ComponentNodeList',
			key: 'ComponentNodeList',
			render: text => <span>{text.length ? text[0].Hostname : '无'}</span>
		},
		{
			title: t('service.componentState'),
			dataIndex: 'ComponentNodeList',
			key: 'SCStateEnum',
			render: (text: ComponentNodeVo[]) => {
				return text.length ? (
					<Badge status={stateText[text[0].SCStateEnum].status as BadgeStatus} text={t(stateText[text[0].SCStateEnum].label)} />
				) : (
					'无'
				);
			}
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
			render: (_text, record) => {
				return record.ComponentNodeList.length ? (
					<Space>
						{buttonConfigItem(record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				) : (
					'无'
				);
			}
		}
	];
	const handleOk = () => {
		setSelectedZKFC(selectedRows);
		setMigrateStep(['3']);
	};

	useEffect(() => {
		// setLoading(false);
		const zkFailoverControllers = zkfcList.filter(component => {
			// 检查ComponentName是否以"ZKFailoverController"开头
			if (component.ComponentName.startsWith('ZKFailoverController')) {
				// 提取ZKFailoverController名称中的数字部分
				const zkNumberStr = component.ComponentName.slice('ZKFailoverController'.length);
				const zkNumber = parseInt(zkNumberStr, 10);

				// 检查是否存在对应的NameNode
				for (const nn of selectedNameNode) {
					// 假设NameNode的ComponentName是"NameNode"后跟数字，提取这个数字
					const nnNumberStr = nn.ComponentName.slice('NameNode'.length);
					const nnNumber = parseInt(nnNumberStr, 10);

					// 如果ZKFailoverController的数字与NameNode的数字匹配，则返回true
					if (zkNumber === nnNumber) {
						return true;
					}
				}
			}
			// 如果没有找到匹配的ZKFailoverController，则返回false
			return false;
		});
		setZkFailoverControllerList(zkFailoverControllers);
	}, [selectedNameNode, zkfcList]);

	const rowSelection = {
		type: 'radio' as RowSelectionType,
		onChange: (_selectedRowKeys: React.Key[], selectedRows: ComponentSummaryVo[]) => {
			setSelectedRows(selectedRows);
		},
		getCheckboxProps: (record: ComponentSummaryVo) => ({
			disabled: !!record.ComponentNodeList.length // Column configuration not to be checked
		})
	};
	return (
		<>
			{contextHolder}
			<Table
				rowKey="ComponentName"
				columns={columns}
				dataSource={zkFailoverControllerList}
				rowSelection={{
					...rowSelection
				}}
			/>
			<Space className="mt-[20px] flex justify-center">
				<Button type="primary" disabled={!selectedRows.length} onClick={handleOk}>
					{t('next')}
				</Button>
				<Button type="primary" ghost>
					{t('cancel')}
				</Button>
			</Space>
			{isActiveJobModalOpen ? (
				<ViewActiveJobModal isModalOpen={isActiveJobModalOpen} handleCancel={handleModalOk} type="jobProgress" />
			) : null}
		</>
	);
};
export default SelectZKFC;
