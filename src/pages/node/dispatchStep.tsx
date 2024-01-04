import { useEffect, useState, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Progress } from 'antd';
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
const twoColors = { '0%': '#108ee9', '100%': '#87d068' };

const DispatchStep: React.FC = forwardRef(() => {
	const { dispatchedList, setSelectedRows, jobNodeId } = useStore();
	const [tableData, setTableData] = useState(dispatchedList);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiSpeed = APIConfig.dispatchList;
	const apiProgress = APIConfig.dispatchProgress;
	let stopPolling: Function;
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			width: 100,
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.progress'),
			dataIndex: 'NodeState',
			render: () => <Progress percent={30} strokeColor={twoColors} strokeWidth={3} />
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			width: 100,
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
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedRows(selectedRows);
		}
	};

	const getSpeed = async () => {
		const data = await RequestHttp.get(apiSpeed, { params: { ClusterId: id } });
		const progressData = await RequestHttp.get(apiProgress, { params: { NodeJobId: jobNodeId } });
		const {
			Data: { NodeInitDetailList }
		} = data;
		const {
			Data: { NodeJobTransferProgressList }
		} = progressData;

		let mergedData = NodeInitDetailList.map(item1 => {
			let item2 = NodeJobTransferProgressList.filter(item2 => item2.NodeId === item1.NodeId);
			if (item2.length > 0) {
				return { ...item1, ...item2 };
			} else {
				return item1;
			}
		});
		console.log(121212, mergedData);
		return mergedData;
	};

	const getData = () => {
		const callbackFunc = (speedData: { NodeInitDetailList: DataType[] }) => {
			setTableData(speedData.NodeInitDetailList);
		};
		stopPolling = pollRequest(() => getSpeed(), callbackFunc, ['PUSH_OK', 'PUSH_ERROR'], 5000);
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
export default DispatchStep;
