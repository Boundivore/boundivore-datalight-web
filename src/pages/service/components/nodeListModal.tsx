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
 * NodeListModal - 选择组件时绑定的节点弹窗
 * @param {boolean} isModalOpen - 弹窗是否打开
 * @param {function} handleOk - 弹窗确定的回调函数
 * @param {function} handleCancel - 弹窗取消的回调函数
 * @param {function} handleCancel - 弹窗取消的回调函数
 * @param {string} component - 关联的组件名称
 * @author Tracy.Guo
 */
import { useState } from 'react';
import { Modal, Table, Space, Button, Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownOutlined } from '@ant-design/icons';

const NodeListModal: React.FC = ({ isModalOpen, nodeList, handleOk, handleCancel }) => {
	const [tableData] = useState(nodeList);
	const [selectedNodeList, setSelectedNodeList] = useState([]);
	const { t } = useTranslation();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('service.createGroup'),
			callback: () => {},
			disabled: !selectedNodeList.length
		},
		{
			id: 2,
			label: t('service.moveToGroup'),
			disabled: !selectedNodeList.length,
			type: 'dropdown'
		}
	];
	const columns = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		}
	];
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: []) => {
			setSelectedNodeList(selectedRows);
		}
	};
	const items = [
		{
			key: 1,
			label: '分组'
		}
	];
	return (
		<Modal title="Basic Modal" open={isModalOpen} onOk={() => handleOk(selectedNodeList)} onCancel={handleCancel}>
			<Space>
				{buttonConfigTop.map(button => {
					return button.type === 'dropdown' ? (
						<Dropdown.Button icon={<DownOutlined />} menu={{ items }} disabled={button.disabled}>
							{button.label}
						</Dropdown.Button>
					) : (
						<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
							{button.label}
						</Button>
					);
				})}
			</Space>
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="NodeId"
				dataSource={tableData}
				columns={columns}
			/>
		</Modal>
	);
};
export default NodeListModal;
