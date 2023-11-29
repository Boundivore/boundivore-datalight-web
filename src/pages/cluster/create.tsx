import Layouts from '@/layouts';
import { Card, Button, Col, Row, Form, Input } from 'antd';
// import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};

type FieldType = {
	ClusterName?: string;
	ClusterType?: string;
	ClusterDesc?: string;
	DlcVersion?: string;
	RelativeClusterId?: number;
};
const CreateCluster: React.FC = () => {
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const handleOk = () => {
		const api = APIConfig.createCluster;
		form.validateFields().then(
			values => {
				// setSubmittable(true);
				RequestHttp.post(api, values);
				console.log(11111, values);
			},
			errorInfo => {
				// setSubmittable(false);
				console.log('Failed:', errorInfo);
			}
		);
		setTimeout(() => {
			// setConfirmLoading(false);
		}, 2000);
	};

	return (
		<Layouts hideSider={false}>
			<Row
				style={{
					width: '96%',
					height: 'calc(100% - 40px)',
					margin: '20px auto',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				{/* <Col span={6} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }}>
						<Steps
							direction="vertical"
							items={[
								{
									title: t('cluster.create'),
									status: 'finish',
									icon: <UserOutlined />,
									description: 'description'
								},
								{
									title: t('cluster.parseHostname'),
									status: 'finish',
									icon: <SolutionOutlined />,
									description: 'description'
								},
								{
									title: 'Pay',
									status: 'process',
									icon: <LoadingOutlined />,
									description: 'description'
								},
								{
									title: 'Done',
									status: 'wait',
									icon: <SmileOutlined />,
									description: 'description'
								}
							]}
						/>
					</Card>
				</Col> */}
				<Col span={24} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }} title={t('cluster.create')}>
						<Form
							form={form}
							name="basic"
							{...layout}
							style={{ maxWidth: 600 }}
							initialValues={{ remember: true }}
							// onFinish={onFinish}
							// onFinishFailed={onFinishFailed}
							autoComplete="off"
						>
							<Form.Item<FieldType>
								label={t('cluster.name')}
								name="ClusterName"
								rules={[{ required: true, message: 'Please input your username!' }]}
							>
								<Input />
							</Form.Item>
							<Form.Item<FieldType>
								label={t('cluster.type')}
								name="ClusterType"
								rules={[{ required: true, message: 'Please input your username!' }]}
							>
								<Input />
							</Form.Item>
							<Form.Item<FieldType>
								label={t('cluster.description')}
								name="ClusterDesc"
								rules={[{ required: true, message: 'Please input your username!' }]}
							>
								<Input />
							</Form.Item>
							<Form.Item<FieldType>
								label={t('cluster.dlcVersion')}
								name="DlcVersion"
								rules={[{ required: true, message: 'Please input your username!' }]}
							>
								<Input />
							</Form.Item>
							<Form.Item<FieldType>
								label={t('cluster.relativeClusterId')}
								name="RelativeClusterId"
								rules={[{ required: true, message: 'Please input your username!' }]}
							>
								<Input />
							</Form.Item>
						</Form>
						<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
							<Button type="primary" size={'large'} onClick={handleOk}>
								{t('cluster.create')}
							</Button>
						</Form.Item>
					</Card>
				</Col>
			</Row>
		</Layouts>
	);
};

export default CreateCluster;
