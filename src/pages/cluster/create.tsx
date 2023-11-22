import Layouts from '@/layouts';
import { Card, Button, Col, Row, Steps, Form, Input } from 'antd';
import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const layout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 20 }
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

	return (
		<Layouts hideSider={true}>
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
				<Col span={6} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }}>
						<Steps
							direction="vertical"
							items={[
								{
									title: 'Login',
									status: 'finish',
									icon: <UserOutlined />,
									description: 'description'
								},
								{
									title: 'Verification',
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
				</Col>
				<Col span={18} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }}>
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
						<Button type="primary" size={'large'}>
							{t('cluster.create')}
						</Button>
					</Card>
				</Col>
			</Row>
		</Layouts>
	);
};

export default CreateCluster;
