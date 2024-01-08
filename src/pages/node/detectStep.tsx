import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import { pollRequest } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useSetStep from './hooks/useSetStep';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}

const stableState = ['ACTIVE', 'INACTIVE'];

const DetectStep: React.FC = forwardRef((props, ref) => {
	const { selectedRows, setCheckedList, setSelectedRows } = useStore();
	const [tableData, setTableData] = useState([]);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	useSetStep('PROCEDURE_DETECT');
	const id = searchParams.get('id');
	const apiSpeed = APIConfig.detectList;
	let stopPolling: Function;
	let stateText: { [key: string]: any };
	stateText = {
		// eslint-disable-next-line prettier/prettier
		'ACTIVE': {
			label: t('node.active'),
			status: 'success'
		},
		// eslint-disable-next-line prettier/prettier
		'DETECTING': {
			label: t('node.detecting'),
			status: 'processing'
		},
		// eslint-disable-next-line prettier/prettier
		'INACTIVE': {
			label: t('node.inactive'),
			status: 'error'
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
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiCheck = APIConfig.check;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'CHECK',
			NodeInfoList: selectedRows.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiCheck, params);
		setCheckedList(selectedRows);
		return Promise.resolve(jobData);
	};

	const getSpeed = async () => {
		const data = await RequestHttp.get(apiSpeed, { params: { ClusterId: id } });
		return data.Data.NodeInitDetailList;
	};

	const getData = () => {
		const callbackFunc = speedData => {
			// setTableData(tableData);
			setTableData(speedData);
		};
		stopPolling = pollRequest(() => getSpeed(), callbackFunc, stableState, 5000);
	};
	useEffect(() => {
		getData();
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
export default DetectStep;
