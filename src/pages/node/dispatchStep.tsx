import { useEffect, useState, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Progress, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import { pollRequest } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

interface DataType {
	[x: string]: any;
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
const twoColors = { '0%': '#108ee9', '100%': '#87d068' };
const stableState = ['PUSH_OK', 'PUSH_ERROR'];

const DispatchStep: React.FC = forwardRef(() => {
	const { setSelectedRows, jobNodeId } = useStore();
	const [tableData, setTableData] = useState([]);
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
			dataIndex: 'FileBytesProgress',
			render: (text, record) => {
				console.log(4444, record);
				return (
					<>
						{text ? (
							<>
								<Space>
									{Number(text.TotalProgress) !== 100 ? <LoadingOutlined /> : null}
									<span>
										{t('node.fileProgress')}
										{`${record.FileCountProgress.TotalTransferFileCount}/${record.FileCountProgress.TotalFileCount}`}
									</span>
									<span>
										{t('node.speed')}
										{record.CurrentFileProgress.CurrentPrintSpeed}
									</span>
								</Space>
								<Progress percent={Number(text.TotalProgress).toFixed(2)} strokeColor={twoColors} />
							</>
						) : null}
					</>
				);
			}
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
		},
		getCheckboxProps: (record: DataType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
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
				return { ...item1, ...item2[0] };
			} else {
				return item1;
			}
		});
		console.log(12121, mergedData);
		return mergedData;
	};

	const getData = () => {
		const callbackFunc = speedData => {
			console.log(6666, speedData);
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
export default DispatchStep;
