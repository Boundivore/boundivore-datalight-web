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
 * SelectNameNode- 选择要迁移的NameNode, 第一步
 * @author Tracy
 */
import { FC, useState } from 'react';
import { t } from 'i18next';
import { Table, Badge, Button, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import { RowSelectionType } from 'antd/es/table/interface';
import { ComponentSummaryVo, ComponentNodeVo, BadgeStatus } from '@/api/interface';
import useStore from '@/store/store';
import useComponentOperations from '@/hooks/useComponentOperations';
import ViewActiveJobModal from '@/components/viewActiveJobModal';

interface SelectNameNodeProps {
	nameNodeList: ComponentSummaryVo[];
	onClose: () => void;
}
const serviceName = 'HDFS';
const SelectNameNode: FC<SelectNameNodeProps> = ({ nameNodeList, onClose }) => {
	const [selectedRows, setSelectedRows] = useState<ComponentSummaryVo[]>([]);
	const { stateText, setSelectedNameNode, setMigrateStep, setSelectedZKFC, setReloadConfigFile, setReloadMigrateList } =
		useStore();
	const { removeComponent, operateComponent, isActiveJobModalOpen, handleModalOk, contextHolder } =
		useComponentOperations(serviceName);
	// 单条操作按钮配置
	const buttonConfigItem = (record: ComponentSummaryVo) => {
		const { ComponentNodeList, ComponentName } = record;
		const mergeData = ComponentNodeList.map((node: ComponentNodeVo) => ({
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
		setSelectedNameNode(selectedRows);
		setMigrateStep(['2']);
	};
	const handleCancel = () => {
		setSelectedNameNode([]);
		setSelectedZKFC([]);
		setReloadConfigFile(false);
		setReloadMigrateList(false);
		setMigrateStep(['1']);
		onClose();
	};

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
				dataSource={nameNodeList}
				rowSelection={{
					...rowSelection
				}}
			/>
			<Space className="mt-[20px] flex justify-center">
				<Button type="primary" disabled={!selectedRows.length} onClick={handleOk}>
					{t('next')}
				</Button>
				<Button type="primary" ghost onClick={handleCancel}>
					{t('cancel')}
				</Button>
			</Space>
			{isActiveJobModalOpen ? (
				<ViewActiveJobModal isModalOpen={isActiveJobModalOpen} handleCancel={handleModalOk} type="jobProgress" />
			) : null}
		</>
	);
};
export default SelectNameNode;
