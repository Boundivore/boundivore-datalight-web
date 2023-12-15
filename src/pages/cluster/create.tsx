import { useState } from 'react';
import Layouts from '@/layouts';
import { Card, Button, Col, Row, Form, Input } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { ClusterNewRequest } from '@/api/interface';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};

const CreateCluster: React.FC = () => {
	const [success, setSuccess] = useState(false);
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const handleOk = async () => {
		const api = APIConfig.createCluster;
		const values: ClusterNewRequest = await form.validateFields();
		const data = await RequestHttp.post(api, values);
		if (data.Code) {
			setSuccess(true);
		}
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
				<Col span={24} style={{ height: '100%' }}>
					<Card style={{ height: '100%' }} title={t('cluster.create')}>
						{!success ? (
							<Form
								form={form}
								name="basic"
								{...layout}
								style={{ maxWidth: 600 }}
								initialValues={{ remember: true }}
								autoComplete="off"
							>
								<Form.Item
									label={t('cluster.name')}
									name="ClusterName"
									rules={[{ required: true, message: `${t('cluster.nameCheck')}` }]}
								>
									<Input />
								</Form.Item>
								<Form.Item
									label={t('cluster.type')}
									name="ClusterType"
									rules={[{ required: true, message: `${t('cluster.typeCheck')}` }]}
								>
									<Input />
								</Form.Item>
								<Form.Item
									label={t('cluster.description')}
									name="ClusterDesc"
									rules={[{ required: true, message: `${t('cluster.desCheck')}` }]}
								>
									<Input />
								</Form.Item>
								<Form.Item
									label={t('cluster.dlcVersion')}
									name="DlcVersion"
									rules={[{ required: true, message: `${t('cluster.desCheck')}` }]}
								>
									<Input />
								</Form.Item>
								<Form.Item
									label={t('cluster.relativeClusterId')}
									name="RelativeClusterId"
									rules={[{ message: `${t('cluster.desCheck')}` }]}
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
							<div style={{ fontSize: '40px', textAlign: 'center' }}>
								<p>
									<Trans
										i18nKey="cluster.createSucc"
										defaults="hello <0>121212</0>"
										components={{
											0: <i />
										}}
									/>
								</p>

								{/* <p>{t('cluster.createSucc', { link: <a href="/my-link">这里</a> })}</p> */}
								<Button type="primary">{t('cluster.backToList')}</Button>
							</div>
						)}
					</Card>
				</Col>
			</Row>
		</Layouts>
	);
};

export default CreateCluster;
