import React, { useState } from 'react';
import Layouts from '@/layouts';
import { Card, Button, Col, Row, Form, Input, Steps } from 'antd';
import { LoadingOutlined, SmileOutlined, SolutionOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import InitNodeList from './initList';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const { TextArea } = Input;

type FieldType = {
	Hostname: string;
	SshPort: string;
};
const InitNode: React.FC = () => {
	const [showForm] = useState(false);
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
				<Col span={6} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }}>
						<Steps
							direction="vertical"
							items={[
								{
									title: t('node.parseHostname'),
									status: 'finish',
									icon: <SolutionOutlined />,
									description: 'description'
								},
								{
									title: t('node.detect'),
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
					<Card style={{ height: '100%' }} title={t('node.parseHostname')}>
						{showForm ? (
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
									label={t('node.hostName')}
									name="Hostname"
									rules={[{ required: true, message: 'Please input your username!' }]}
								>
									<TextArea rows={4} />
								</Form.Item>
								<Form.Item<FieldType>
									label={t('node.port')}
									name="SshPort"
									rules={[{ required: true, message: 'Please input your username!' }]}
								>
									<Input />
								</Form.Item>
								<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
									<Button type="primary" size={'large'} onClick={handleOk}>
										{t('cluster.create')}
									</Button>
								</Form.Item>
							</Form>
						) : (
							<InitNodeList />
						)}
					</Card>
				</Col>
			</Row>
		</Layouts>
	);
};

export default InitNode;
