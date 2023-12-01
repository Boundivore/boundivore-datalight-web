import Layouts from '@/layouts';
import { Card, Button } from 'antd';
import RequestHttp from '@/api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CreateCluster from './modal/createCluster';

const Cluster: React.FC = () => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation();
	const api = '/mock/2601924/api/v1/master/cluster/new';

	const getData = () => {
		RequestHttp.post(api);
	};
	// const showModal = () => {
	// 	setOpen(true);
	// };
	const handleOk = () => {
		setOpen(false);
	};

	const handleCancel = () => {
		setOpen(false);
	};
	useEffect(() => {
		getData();
	}, []);
	return (
		<>
			<Layouts hideSider={false}>
				<Card
					style={{
						width: '96%',
						height: 'calc(100% - 40px)',
						minHeight: '600px',
						margin: '20px auto',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Button type="primary" size={'large'}>
						<Link to="create">{t('cluster.create')}</Link>
					</Button>
				</Card>
			</Layouts>
			<CreateCluster open={open} onOk={handleOk} onCancel={handleCancel}></CreateCluster>
		</>
	);
};

export default Cluster;
