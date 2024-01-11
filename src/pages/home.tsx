import Layouts from '@/layouts';
import { Table, Button, Card, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';

interface DataType {
	ClusterId: number;
	ClusterDesc: string;
	ClusterName: string;
	ClusterType: string;
	ClusterState: string;
	DlcVersion: string;
	RelativeClusterId: number;
}

const columns: ColumnsType<DataType> = [
	{
		title: 'Name',
		dataIndex: 'ClusterName',
		key: 'ClusterName',
		render: (text, record) => <a href={`/node/init?id=${record.ClusterId}`}>{text}</a>
	},
	{
		title: 'Age',
		dataIndex: 'ClusterDesc',
		key: 'ClusterDesc'
	},
	{
		title: 'Address',
		dataIndex: 'ClusterType',
		key: 'ClusterType'
	},
	{
		title: 'Tags',
		key: 'ClusterState',
		dataIndex: 'ClusterState'
	}
];

const Home: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isNeedChangePassword } = useStore();
	const [tableData, setTableData] = useState([]);
	const { modal } = App.useApp();
	const api = APIConfig.getClusterList;
	const getData = async () => {
		const data = await RequestHttp.get(api);
		const {
			Data: { ClusterList }
		} = data;
		setTableData(ClusterList);
	};
	useEffect(() => {
		getData();
		isNeedChangePassword &&
			modal.confirm({
				title: 'This is a warning message',
				content: 'some messages...some messages...'
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Layouts>
			<Card className="h-[calc(100%-100px)] min-h-[600px] m-[20px]">
				<Button
					type="primary"
					onClick={() => {
						navigate('/cluster/create');
					}}
				>
					{t('cluster.create')}
				</Button>
				<Table rowKey="ClusterId" columns={columns} dataSource={tableData} />
			</Card>
		</Layouts>
	);
};

export default Home;
