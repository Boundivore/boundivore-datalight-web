import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
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
	const { setSelectedRows, parsedList, selectedRows, setDetectedList } = useStore();
	const [tableData, setTableData] = useState(parsedList);
	let stopPolling: Function;
	// const handleOk = () => {};
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
			render: (text: string) => <a>{text}</a>
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
			setSelectedRows(selectedRows);
		}
	};

	const getState = async () => {
		const data = await RequestHttp.get(apiState, { ClusterId: id });
		return data;
	};
	const getParse = async () => {
		const callbackFunc = (stateData: { NodeInitDetailList: DataType[] }) => {
			tableData.map((dataItem: string) => {
				const matchItem = stateData.NodeInitDetailList.find((stateItem: DataType) => {
					return stateItem.Hostname === dataItem;
				});
				return matchItem;
			});
			setTableData(stateData.NodeInitDetailList);
		};
		stopPolling = pollRequest(getState, callbackFunc, '0', 20000);
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
		setDetectedList(jobData);
		return jobData;
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
