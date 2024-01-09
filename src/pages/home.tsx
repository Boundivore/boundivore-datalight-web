import Layouts from '@/layouts';
import { Table, Card, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
	const [tableData, setTableData] = useState([]);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Layouts>
			<Card style={{ width: '96%', height: 'calc(100% - 40px)', margin: '20px auto' }}>
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
