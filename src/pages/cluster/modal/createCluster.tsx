import React, { useState } from 'react';
import { Modal, ModalProps, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
// import type { FormInstance } from 'antd/es/form';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';

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
const CreateCluster: React.FC<ModalProps> = modalProps => {
	const [confirmLoading, setConfirmLoading] = useState(false);
	const { t } = useTranslation();
	const [form] = Form.useForm();

	const handleOk = () => {
		const api = APIConfig.createCluster;
		setConfirmLoading(true);
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
			setConfirmLoading(false);
		}, 2000);
		modalProps.onOk && modalProps.onOk();
	};

	const handleCancel = () => {
		console.log('Clicked cancel button');
		modalProps.onCancel && modalProps.onCancel();
	};

	return (
		<Modal
			title={t('cluster.create')}
			open={modalProps.open}
			onOk={handleOk}
			confirmLoading={confirmLoading}
			onCancel={handleCancel}
		>
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
		</Modal>
	);
};

export default CreateCluster;
