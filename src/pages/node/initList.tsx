import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { pollRequest } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';

// import RequestHttp from '@/api';
// import APIConfig from '@/api/config';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}

const InitNodeList: React.FC = forwardRef((props, ref) => {
	const { t } = useTranslation();
	const { setSelectedRows, selectedRows, setDetectedList } = useStore();
	const [tableData, setTableData] = useState([]);
	let stopPolling: Function;
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiState = APIConfig.nodeInitList;
	let stateText: { [key: string]: any };
	stateText = {
		// eslint-disable-next-line prettier/prettier
		'RESOLVED': {
			label: t('node.resolved'),
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
			console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
			setSelectedRows(selectedRows);
		},
		getCheckboxProps: (record: DataType) => ({
			disabled: record.NodeState !== 'RESOLVED' // Column configuration not to be checked
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
		stopPolling = pollRequest(getState, callbackFunc, ['RESOLVED'], 5000);
	};

	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiDetect = APIConfig.detect;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'DETECT',
			NodeInfoList: selectedRows.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiDetect, params);
		setDetectedList(selectedRows);
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
