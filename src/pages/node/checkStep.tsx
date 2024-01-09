import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import { pollRequest } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
const stableState = ['CHECK_OK', 'CHECK_ERROR'];

const CheckStep: React.FC = forwardRef((props, ref) => {
	const { selectedRowsList, setSelectedRowsList, setJobNodeId } = useStore();
	const [tableData, setTableData] = useState([]);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiSpeed = APIConfig.checkList;
	let stopPolling: Function;
	let stateText: { [key: string]: any };
	stateText = {
		// eslint-disable-next-line prettier/prettier
		'CHECK_OK': {
			label: t('node.check_ok'),
			status: 'success'
		},
		// eslint-disable-next-line prettier/prettier
		'CHECKING': {
			label: t('node.checking'),
			status: 'processing'
		},
		// eslint-disable-next-line prettier/prettier
		'CHECK_ERROR': {
			label: t('node.check_error'),
			status: 'error'
		},
		// eslint-disable-next-line prettier/prettier
		'PUSH_OK': {
			label: t('node.check_error'),
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
		},
		{
			title: t('node.log'),
			dataIndex: 'NodeState',
			render: () => <a> {t('node.viewLog')}</a>
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
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiDispatch = APIConfig.dispatch;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'DISPATCH',
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiDispatch, params);
		setJobNodeId(jobData.Data.NodeJobId);
		return Promise.resolve(jobData);
	};

	const getSpeed = async () => {
		const params = {
			ClusterId: id,
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
		};
		const data = await RequestHttp.post(apiSpeed, params);
		return data.Data.NodeInitDetailList;
	};

	const getData = () => {
		const callbackFunc = speedData => {
			setTableData(speedData);
		};
		stopPolling = pollRequest(() => getSpeed(), callbackFunc, stableState, 1000);
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
export default CheckStep;
