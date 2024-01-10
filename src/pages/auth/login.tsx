import { Button, Form, Input, Col, Row } from 'antd';
import { md5 } from 'js-md5';
import { useNavigate } from 'react-router-dom';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';
import Logo from '@/assets/logo.png';

type FieldType = {
	Principal?: string;
	Credential?: string;
};

const LoginPage: React.FC = () => {
	const [form] = Form.useForm();
	const navigate = useNavigate();
	const { setUserInfo } = useStore();
	const onFinish = async (values: any) => {
		console.log('Success:', values);
		const { Credential, Principal } = values;
		const hexHash = md5(Credential);
		const apiLogin = APIConfig.login;
		const params = {
			Credential: hexHash,
			IdentityType: 'USERNAME',
			Principal
		};
		const authData = await RequestHttp.post(apiLogin, params);
		const {
			Code,
			Data: { UserId, Nickname, Realname }
		} = authData;
		if (Code === '00000') {
			setUserInfo({ UserId, Nickname, Realname });
			navigate('/home');
		}
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log('Failed:', errorInfo);
	};
	return (
		<div className="bg-[url('/loginBg.jpg')] bg-cover bg-center h-screen flex">
			<Row className="w-3/12 height-[150] m-auto p-auto border border-blue-500 shadow-2xl shadow-blue-500">
				{/* <Col span={12} className="bg-[url('/login.png')] bg-cover bg-center"></Col> */}
				<Col span={24} className="py-20 px-10 flex items-center justify-center flex-col">
					<img src={Logo} height={60} className="m-auto p-auto" />
					<Form
						form={form}
						name="basic"
						layout="vertical"
						// labelCol={{ span: 8 }}
						// wrapperCol={{ span: 16 }}
						style={{ width: 300, marginTop: '50px' }}
						onFinish={onFinish}
						onFinishFailed={onFinishFailed}
						autoComplete="off"
						requiredMark={false}
					>
						<Form.Item<FieldType>
							label="账号"
							name="Principal"
							rules={[{ required: true, message: 'Please input your username!' }]}
						>
							<Input />
						</Form.Item>

						<Form.Item<FieldType>
							label="登录凭证"
							name="Credential"
							rules={[{ required: true, message: 'Please input your password!' }]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
							<Button type="primary" htmlType="submit">
								登录
							</Button>
						</Form.Item>
					</Form>
				</Col>
				{/* <Col span={12} className="bg-[url('/login.png')] bg-cover bg-center"></Col> */}
			</Row>
		</div>
	);
};

export default LoginPage;
