import Layouts from '@/layouts';
import { Space, Table, Tag, Card, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import RequestHttp from '@/api';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DataType {
	key: string;
	name: string;
	age: number;
	address: string;
	tags: string[];
}

const columns: ColumnsType<DataType> = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		render: text => <a>{text}</a>
	},
	{
		title: 'Age',
		dataIndex: 'age',
		key: 'age'
	},
	{
		title: 'Address',
		dataIndex: 'address',
		key: 'address'
	},
	{
		title: 'Tags',
		key: 'tags',
		dataIndex: 'tags',
		render: (_, { tags }) => (
			<>
				{tags.map(tag => {
					let color = tag.length > 5 ? 'geekblue' : 'green';
					if (tag === 'loser') {
						color = 'volcano';
					}
					return (
						<Tag color={color} key={tag}>
							{tag.toUpperCase()}
						</Tag>
					);
				})}
			</>
		)
	},
	{
		title: 'Action',
		key: 'action',
		render: (_, record) => (
			<Space size="middle">
				<a>Invite {record.name}</a>
				<a>Delete</a>
			</Space>
		)
	}
];

const data: DataType[] = [
	{
		key: '1',
		name: 'John Brown',
		age: 32,
		address: 'New York No. 1 Lake Park',
		tags: ['nice', 'developer']
	},
	{
		key: '2',
		name: 'Jim Green',
		age: 42,
		address: 'London No. 1 Lake Park',
		tags: ['loser']
	},
	{
		key: '3',
		name: 'Joe Black',
		age: 32,
		address: 'Sydney No. 1 Lake Park',
		tags: ['cool', 'teacher']
	}
];

const Home: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const api = '/mock/2601924/api/v1/master/cluster/new';
	const getData = () => {
		RequestHttp.post(api);
	};
	useEffect(() => {
		getData();
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
				<Table columns={columns} dataSource={data} />
			</Card>
		</Layouts>
	);
};

export default Home;
