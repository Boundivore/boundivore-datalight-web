import { useState, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
// import InitNodeList from './initList';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
// import useStore from '@/store/store';

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
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [form] = Form.useForm();
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const api = APIConfig.parseHostname;
		const values = await form.validateFields();
		const { Hostname, SshPort } = values;
		const data = await RequestHttp.post(api, { ClusterId: id, HostnameBase64: btoa(Hostname), SshPort });
		const validData = data.Data.ValidHostnameList;
		// validData.map((item: string) => ({
		// 	Hostname: item
		// }));
		// setParsedList(validData);
		return Promise.resolve(validData);
		// errorInfo => {
		// 	console.log('Failed:', errorInfo);
		// }
		// );
	};

	return (
		<>
			{
				showForm ? (
					<Form
						form={form}
						name="basic"
						{...layout}
						style={{ maxWidth: 600 }}
						initialValues={{ SshPort: 22 }}
						// onFinish={onFinish}
						// onFinishFailed={onFinishFailed}
						autoComplete="off"
					>
						<Form.Item<FieldType>
							label={t('node.hostName')}
							name="Hostname"
							rules={[{ required: true, message: t('node.hostnameCheck') }]}
						>
							<TextArea rows={4} />
						</Form.Item>
						<Form.Item<FieldType>
							label={t('node.port')}
							name="SshPort"
							rules={[{ required: true, message: t('node.portCheck') }]}
						>
							<Input />
						</Form.Item>
					</Form>
				) : null
				// <InitNodeList data={ListData} />
			}
		</>
	);
});
export default ParseStep;
