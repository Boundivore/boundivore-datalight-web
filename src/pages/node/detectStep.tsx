import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import { pollRequest } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { AxiosResponse } from 'axios';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}

const DetectStep: React.FC = () => {
	const { selectedRows } = useStore();
	const [tableData, setTableData] = useState(selectedRows);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiDetect = APIConfig.detect;
	const apiSpeed = APIConfig.detectList;
	let stopPolling: Function;
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.speed'),
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
			render: () => <a> {t('node.detecting')}</a>
		}
	];

	const getSpeed = async (detectData: AxiosResponse<any, any> | undefined) => {
		const data = await RequestHttp.get(apiSpeed, { ClusterId: detectData.Data.ClusterId });
		return data;
	};
	const detect = async () => {
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'DETECT',
			NodeInfoList: tableData.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiDetect, params);
		getData(jobData);
	};

	const getData = async (detectData: AxiosResponse<any, any> | undefined) => {
		const callbackFunc = (speedData: object) => {
			tableData.map((dataItem: string) => {
				const matchItem = speedData.NodeInitDetailList.find((stateItem: DataType) => {
					return stateItem.Hostname === dataItem;
				});
				return matchItem;
			});
			// setTableData(tableData);
			setTableData(speedData.NodeInitDetailList);
		};
		stopPolling = pollRequest(() => getSpeed(detectData), callbackFunc, '0', 20000);
	};
	useEffect(() => {
		detect();
		return () => stopPolling();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return <Table columns={columns} dataSource={tableData} />;
};
export default DetectStep;
