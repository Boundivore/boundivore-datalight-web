import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from 'antd';
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

const CheckStep: React.FC = forwardRef((props, ref) => {
	const { selectedRows, checkedList, setDispatchedList, setSelectedRows } = useStore();
	const [tableData, setTableData] = useState(checkedList);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiSpeed = APIConfig.dispatchList;
	let stopPolling: Function;
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
			title: t('node.detail'),
			dataIndex: 'NodeState',
			render: () => <a> {t('node.checking')}</a>
		},
		{
			title: t('node.log'),
			dataIndex: 'NodeState',
			render: () => <a> {t('node.viewLog')}</a>
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
			setSelectedRows(selectedRows);
		}
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiDispatch = APIConfig.dispatch;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'CHECk',
			NodeInfoList: selectedRows.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiDispatch, params);
		setDispatchedList(selectedRows);
		return jobData;
	};

	const getSpeed = async () => {
		const data = await RequestHttp.get(apiSpeed, { ClusterId: id });
		return data;
	};

	const getData = () => {
		const callbackFunc = (speedData: { NodeInitDetailList: DataType[] }) => {
			tableData.map((dataItem: string) => {
				const matchItem = speedData.NodeInitDetailList.find((stateItem: DataType) => {
					return stateItem.Hostname === dataItem;
				});
				return matchItem;
			});
			setTableData(speedData.NodeInitDetailList);
		};
		stopPolling = pollRequest(() => getSpeed(), callbackFunc, '0', 20000);
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
