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
 * ParseList - 解析出的节点主机名列表
 * @author Tracy.Guo
 */
import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore, { useComponentAndNodeStore, usePersistStore } from '@/store/store';
import usePolling from '@/hooks/usePolling';
import ItemConfigInfo from '@/components/itemConfigInfo';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
	SshPort: number | string;
}
type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

// const stepName = 'PROCEDURE_PARSE_HOSTNAME';
const nextStepName = 'PROCEDURE_DETECT';

const ParseList: React.FC = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const { stateText, stableState, setCurrentPageDisabled } = useStore();
	const { setSelectedRowsList, selectedRowsList } = useComponentAndNodeStore();
	const {
		userInfo: { userId }
	} = usePersistStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiState = APIConfig.nodeInitList;
	const columns: ColumnsType<DataType> = [
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
		onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedRowsList(nextStepName, selectedRows);
		},
		defaultSelectedRowKeys: selectedRowsList[nextStepName].map(({ NodeId }) => {
			return NodeId;
		}),
		getCheckboxProps: (record: DataType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};

	const getState = async () => {
		const data = await RequestHttp.get(apiState, { params: { ClusterId: id } });
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
		} = data;
		setCurrentPageDisabled({
			next: ExecStateEnum === 'RUNNING' || ExecStateEnum === 'SUSPEND' || selectedRowsList[nextStepName].length === 0
		});
		return NodeInitDetailList;
	};
	// const psrseHostname = async () => {
	// 	const api = APIConfig.parseHostname;
	// 	const values = await form.validateFields();
	// 	const { Hostname, SshPort } = values;
	// 	const data = await RequestHttp.post(api, { ClusterId: id, HostnameBase64: btoa(Hostname), SshPort });
	// 	const validData = data.Data.ValidHostnameList;
	// 	return Promise.resolve(validData);
	// };
	const tableData: DataType[] = usePolling(getState, stableState, 1000);

	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiDetect = APIConfig.detect;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'DETECT',
			NodeInfoList: selectedRowsList[nextStepName].map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: tableData[0].SshPort
		};
		const jobData = await RequestHttp.post(apiDetect, params);
		return Promise.resolve(jobData);
	};
	const getWebState = async () => {
		const api = APIConfig.webStateGet;
		try {
			const params = {
				ClusterId: id,
				UserId: userId,
				WebKey: 'parseStep'
			};
			const data = await RequestHttp.get(api, { params });
			return Promise.resolve(data.Data);
		} catch (error) {
			return Promise.reject(error);
		}
		// return Promise.resolve(data.Data);
	};
	useEffect(() => {
		getWebState();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		setCurrentPageDisabled({ next: selectedRowsList[nextStepName].length === 0 });
	}, [selectedRowsList, setCurrentPageDisabled]);

	return (
		<Table
			rowSelection={{
				...rowSelection
			}}
			rowKey="NodeId"
			columns={columns}
			dataSource={tableData}
		/>
	);
});

export default ParseList;
