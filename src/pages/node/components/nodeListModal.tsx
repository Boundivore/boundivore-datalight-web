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
import { useState, useEffect } from 'react';
import { Modal, Table, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { NodeType, NodeWithComponent } from '@/api/interface';

interface NodeListModalProps {
	isModalOpen: boolean;
	handleOk: (list: NodeType[]) => void;
	handleCancel: () => void;
	component: [];
}

const NodeListModal: React.FC<NodeListModalProps> = ({ isModalOpen, handleOk, handleCancel, component }) => {
	const [tableData, setTableData] = useState([]);
	const [initialLoad, setInitialLoad] = useState(true);
	const [openAlert, setOpenAlert] = useState(false);
	const [errorText, setErrorText] = useState('');
	const [selectedNodeList, setSelectedNodeList] = useState<NodeType[]>([]);
	const { nodeList } = useComponentAndNodeStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	// const [selectedRowKeys, setSelectedRowKeys] = useState(nodeList[id][component]?.map(({ NodeId }) => NodeId));

	const { t } = useTranslation();

	const columns: ColumnsType<NodeType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			key: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('includeComponent'),
			dataIndex: 'ComponentName',
			key: 'ComponentName',
			render: (text: string[]) => text.map(component => component)
		}
	];
	const rowSelection = {
		// selectedRowKeys,
		onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
			setSelectedNodeList(selectedRows);
		},
		defaultSelectedRowKeys: nodeList[id][component].componentNodeList?.map(({ NodeId }) => {
			return NodeId;
		})
	};
	const getList = async () => {
		const apiList = APIConfig.nodeListWithComponent;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		const {
			Data: { NodeWithComponentList }
		} = data;
		const listData = NodeWithComponentList.map((node: NodeWithComponent) => {
			node.NodeDetail.ComponentName = node.ComponentName;
			return node.NodeDetail;
		});
		setTableData(listData);
	};
	// const selectRow = (record: NodeType) => {
	// 	const selectedKeys = [...selectedRowKeys];
	// 	if (selectedKeys.indexOf(record.NodeId) >= 0) {
	// 		selectedKeys.splice(selectedKeys.indexOf(record.NodeId), 1);
	// 	} else {
	// 		selectedKeys.push(record.NodeId);
	// 	}
	// 	setSelectedRowKeys(selectedKeys);
	// };
	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (!initialLoad && !openAlert) {
			handleOk(selectedNodeList);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialLoad, openAlert]);

	return (
		<Modal
			title={t('selectNode')}
			open={isModalOpen}
			onOk={() => {
				const { max, min } = nodeList[id][component];
				if (max == min && max == -1) {
					setOpenAlert(false);
				} else {
					setOpenAlert(selectedNodeList.length > max || selectedNodeList.length < min);
				}
				setInitialLoad(false);
				if (max === min && max != -1) {
					setErrorText(t('node.errorText1', { min }));
				} else if (max != min && max == -1) {
					setErrorText(t('node.errorText3', { min }));
				} else if (max != min && min == -1) {
					setErrorText(t('node.errorText4', { max }));
				} else {
					setErrorText(t('node.errorText2', { min, max }));
				}
			}}
			onCancel={handleCancel}
		>
			{openAlert ? <Alert message={errorText} type="error" /> : null}
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="NodeId"
				dataSource={tableData}
				columns={columns}
				// onRow={record => {
				// 	return {
				// 		onClick: () => selectRow(record) // 点击行
				// 	};
				// }}
			/>
		</Modal>
	);
};
export default NodeListModal;
