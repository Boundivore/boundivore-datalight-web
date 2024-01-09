import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { pollRequest } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
const stableState = ['RESOLVED', 'ACTIVE'];
const InitNodeList: React.FC = forwardRef((props, ref) => {
	const { t } = useTranslation();
	const { setSelectedRowsList, selectedRowsList } = useStore();
	const [tableData, setTableData] = useState([]);
	let stopPolling: Function;
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiState = APIConfig.nodeInitList;

	let stateText: { [key: string]: any };
	stateText = {
		RESOLVED: {
			label: t('node.resolved'),
			status: 'success'
		},
		ACTIVE: {
			label: t('node.active'),
			status: 'success'
		}
	};
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			render: (text: string, record) => (
				<a>
					{text}
					{t('node.core')}
					{record.CpuArch}
					{t('node.gb')}
					{record.DiskTotal}
					{t('node.gb')}
				</a>
			)
		},
		{
			title: t('node.state'),
			dataIndex: 'NodeState',
			render: (text: string) => <Badge status={stateText[text].status} text={stateText[text].label} />
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedRowsList(selectedRows);
		},
		defaultSelectedRowKeys: selectedRowsList.map(({ NodeId }) => {
			return NodeId;
		}),
		getCheckboxProps: (record: DataType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};

	const getState = async () => {
		const data = await RequestHttp.get(apiState, { params: { ClusterId: id } });
		return data.Data.NodeInitDetailList;
	};
	const getParse = async () => {
		const callbackFunc = stateData => {
			setTableData(stateData);
		};
		stopPolling = pollRequest(getState, callbackFunc, stableState, 1000);
	};

	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiDetect = APIConfig.detect;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'DETECT',
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiDetect, params);
		// setDetectedList(selectedRows);
		return Promise.resolve(jobData);
	};

	useEffect(() => {
		getParse();
		return () => stopPolling();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
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

export default InitNodeList;
