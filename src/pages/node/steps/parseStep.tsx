/**
 * Copyright (C) <2023> <Boundivore> <boundivore@foxmail.com>
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the Apache License, Version 2.0
 * as published by the Apache Software Foundation.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * Apache License, Version 2.0 for more details.
 * <p>
 * You should have received a copy of the Apache License, Version 2.0
 * along with this program; if not, you can obtain a copy at
 * http://www.apache.org/licenses/LICENSE-2.0.
 */
/**
 * ParseStep - 解析节点主机名步骤, 第一步
 * @author Tracy.Guo
 */
import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import useStepLogic from '@/hooks/useStepLogic';
import useStore from '@/store/store';
import { ParseHostnameType } from '@/api/interface';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const { TextArea } = Input;

const stepName = 'parseStep';

const ParseStep: React.FC = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const { setCurrentPageDisabled } = useStore();
	const { useGetSepData, useSetStepData } = useStepLogic();
	const { webState } = useGetSepData('', stepName);
	const [form] = Form.useForm();
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = useSetStepData(stepName, form, null);
	useEffect(() => {
		setCurrentPageDisabled({ next: false });
		form.setFieldsValue(webState[stepName]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [webState]);

	return (
		<Form form={form} name="basic" {...layout} style={{ maxWidth: 600 }} initialValues={{ SshPort: 22 }} autoComplete="off">
			<Form.Item<ParseHostnameType>
				label={t('node.hostName')}
				name="Hostname"
				rules={[{ required: true, message: t('node.hostnameCheck') }]}
			>
				<TextArea rows={4} />
			</Form.Item>
			<Form.Item<ParseHostnameType>
				label={t('node.port')}
				name="SshPort"
				rules={[{ required: true, message: t('node.portCheck') }]}
			>
				<Input />
			</Form.Item>
		</Form>
	);
});
export default ParseStep;
