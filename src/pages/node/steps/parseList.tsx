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
 * ParseList - 解析出的节点主机名列表, 第二步
 * @author Tracy.Guo
 */
import React, { useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';
import usePolling from '@/hooks/usePolling';
import useStepLogic from '@/hooks/useStepLogic';
import ItemConfigInfo from '@/components/itemConfigInfo';
import { NodeType, ParseHostnameType, BadgeStatus } from '@/api/interface';

const preStepName = 'parseStep'; // 当前步骤页面基于上一步的输入和选择生成
const stepName = 'parseList';

const ParseList: React.FC = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { stateText, stableState, setCurrentPageDisabled } = useStore();
	const [selectedRowsList, setSelectedRowsList] = useState<NodeType[]>([]);
	const [defaultRowsList, setDefaultRowsList] = useState<NodeType[]>([]);
	const [parseState, setParseState] = useState(false);
	const { useGetSepData, useSetStepData } = useStepLogic();
	const { webState, selectedList } = useGetSepData(preStepName, stepName);
	const columns: ColumnsType<NodeType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			render: (text: string, record) => <ItemConfigInfo text={text} record={record} />
		},
		{
			title: t('node.state'),
			dataIndex: 'NodeState',
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		}
	];
	const rowSelection = {
		selectedRowKeys: defaultRowsList.length
			? defaultRowsList.map(row => {
					return row.Hostname;
			  })
			: [],
		onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
			setSelectedRowsList(selectedRows);
			setDefaultRowsList(selectedRows);
		},
		getCheckboxProps: (record: NodeType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};

	const getState = async () => {
		const apiState = APIConfig.nodeInitList;
		const data = await RequestHttp.get(apiState, { params: { ClusterId: id } });
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
		} = data;
		setCurrentPageDisabled({
			next: ExecStateEnum === 'RUNNING' || ExecStateEnum === 'SUSPEND'
		});
		return NodeInitDetailList;
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = useSetStepData(stepName, null, selectedRowsList);

	const parseHostname = async (webState: { [key: string]: NodeType[] | ParseHostnameType }, selectedList: NodeType[]) => {
		setDefaultRowsList(selectedList);
		const apiParse = APIConfig.parseHostname;
		const { Hostname, SshPort } = webState[preStepName] as ParseHostnameType;
		const data = await RequestHttp.post(apiParse, { ClusterId: id, HostnameBase64: btoa(Hostname), SshPort });
		setParseState(data.Code === '00000');
	};
	useEffect(() => {
		setCurrentPageDisabled({ next: selectedRowsList.length === 0 });
	}, [selectedRowsList, setCurrentPageDisabled]);
	useEffect(() => {
		webState[preStepName] && parseHostname(webState, selectedList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [webState]);
	const tableData: NodeType[] = usePolling(getState, stableState, 1000, [parseState]);
	useEffect(() => {
		if (defaultRowsList.length) {
			const defaultSelectedRows = tableData.filter(data => defaultRowsList.some(obj => obj.Hostname === data.Hostname));
			setSelectedRowsList(defaultSelectedRows);
		}
	}, [tableData, defaultRowsList]);

	return (
		<Table
			rowSelection={{
				...rowSelection
			}}
			rowKey="Hostname"
			columns={columns}
			dataSource={tableData}
		/>
	);
});

export default ParseList;
