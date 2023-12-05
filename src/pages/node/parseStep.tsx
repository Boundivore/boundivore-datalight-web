import { useState, forwardRef, useImperativeHandle } from 'react';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import InitNodeList from './initList';
// import RequestHttp from '@/api';
// import APIConfig from '@/api/config';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const { TextArea } = Input;

type FieldType = {
	Hostname: string;
	SshPort: string;
};

const ParseStep: React.FC = forwardRef((props, ref) => {
	const [showForm] = useState(true);
	const { t } = useTranslation();
	const [form] = Form.useForm();
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = () => {
		// const api = APIConfig.createCluster;
		// form.validateFields().then(
		// 	values => {
		// 		// setSubmittable(true);
		// 		RequestHttp.post(api, values);
		// 		console.log(11111, values);
		// 		setShowForm(false);
		// 	},
		// 	errorInfo => {
		// 		// setSubmittable(false);
		// 		console.log('Failed:', errorInfo);
		// 	}
		// );
		setTimeout(() => {
			// setConfirmLoading(false);
		}, 2000);
	};
	return (
		<>
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
					{/* <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button type="primary" size={'large'} onClick={handleOk}>
							{t('node.parseHostname')}
						</Button>
					</Form.Item> */}
				</Form>
			) : (
				<InitNodeList />
			)}
		</>
	);
});
export default ParseStep;
