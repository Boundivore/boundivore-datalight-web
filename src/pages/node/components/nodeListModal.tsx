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
// import { useEffect, useState } from 'react';
import { Modal, Table } from 'antd';
import useStore, { useComponentAndNodeStore } from '@/store/store';
import { useTranslation } from 'react-i18next';

const NodeListModal: React.FC = ({ isModalOpen, handleOk, handleCancel, component }) => {
	const { selectedRowsList } = useStore();
	const { nodeList, setNodeList } = useComponentAndNodeStore();
	console.log(999, nodeList);
	const { t } = useTranslation();

	const columns = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			console.log(selectedRowKeys, selectedRows);
			setNodeList({ ...nodeList, [component]: selectedRows });
			// setSelectedRowsList(selectedRows);
		},
		defaultSelectedRowKeys: selectedRowsList.map(({ NodeId }) => {
			return NodeId;
		})
	};

	// useEffect(() => {}, []);
	return (
		<Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="NodeId"
				dataSource={selectedRowsList}
				columns={columns}
			/>
		</Modal>
	);
};
export default NodeListModal;
