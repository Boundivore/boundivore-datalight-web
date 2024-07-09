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
import React from 'react';
import { t } from 'i18next';
import { Table, Badge, Button, Space } from 'antd';
import { ComponentSummaryVo, ComponentNodeVo, BadgeStatus } from '@/api/interface';
import useStore from '@/store/store';

const SelectNameNode: React.FC = ({ componentList }) => {
	const { stateText, setSelectedNameNode } = useStore();
	// 单条操作按钮配置
	const buttonConfigItem = (record: ComponentNodeVo) => {
		// const { NodeId, Hostname, SshPort } = record;
		return [
			{
				id: 1,
				label: t('stop'),
				callback: () => {},
				disabled: record.SCStateEnum === 'STOPPED' || record.SCStateEnum === 'STOPPING'
			},
			{
				id: 2,
				label: t('remove'),
				callback: () => {},
				disabled: record.SCStateEnum !== 'STOPPED'
			}
		];
	};
	const columns: TableColumnType<ComponentSummaryVo> = [
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
			render: (text: string) => {
				text.length ? (
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
				return (
					<Space>
						{buttonConfigItem(record)
							.filter(button => !button.hidden)
							.map(button => (
								<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
									{button.label}
								</Button>
							))}
					</Space>
				);
			}
		}
	];

	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: ComponentNodeVo[]) => {
			setSelectedNameNode(selectedRows);
			if (selectedRows.length > 0) {
				// const { setStepData } = useSetStepData(1);
				// setStepData({
				// 	nameNodeList: selectedRows
				// });
			}
		}
	};
	return (
		<Table
			rowKey="ComponentName"
			columns={columns}
			dataSource={componentList}
			rowSelection={{
				...rowSelection
			}}
		/>
	);
};
export default SelectNameNode;
