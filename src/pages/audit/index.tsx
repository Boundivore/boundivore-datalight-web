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
 * 审计管理列表页
 * @author Tracy
 */
import { FC, useEffect, useState } from 'react';
import { Space, Input, Form, Button, Table } from 'antd';
import { t } from 'i18next';
import useNavigater from '@/hooks/useNavigater';
import ContainerCard from '@/components/containerCard';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
const AuditList: FC = () => {
	const [form] = Form.useForm();
	const [tableData, setTableData] = useState([]);
	const { navigateToAuditDetail } = useNavigater();
	// 单条操作按钮配置
	const buttonConfigItem = (record: NodeType) => {
		return [
			{
				id: 1,
				label: t('detail'),
				callback: () => navigateToAuditDetail(record.AuditLogId),
				disabled: false
			}
		];
	};
	const columns = [
		{
			title: t('audit.opName'),
			dataIndex: 'OpName',
			key: 'OpName'
		},
		{
			title: t('audit.logType'),
			dataIndex: 'LogType',
			key: 'LogType'
		},
		{
			title: t('audit.ip'),
			dataIndex: 'Ip',
			key: 'Ip'
		},
		{
			title: t('audit.dateFormat'),
			dataIndex: 'DateFormat',
			key: 'DateFormat'
		},
		{
			title: t('detail'),
			dataIndex: 'Operation',
			key: 'Operation',
			render: (_text, record) => {
				return (
					<Space>
						{buttonConfigItem(record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
	];
	const getList = async () => {
		const api = APIConfig.getAuditLogSimpleList;
		const params = {
			CurrentPage: 1,
			PageSize: 10
		};
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { AuditLogSimpleList }
		} = data;
		setTableData(AuditLogSimpleList);
		console.log(AuditLogSimpleList);
	};
	const onFinish = (values: any) => {
		console.log('Finish:', values);
	};
	useEffect(() => {
		getList();
	}, []);
	return (
		<ContainerCard>
			{/* <Flex justify="space-between"> */}
			<Space>
				<Form form={form} name="horizontal_login" layout="inline" onFinish={onFinish}>
					<Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
						<Input placeholder="Username" />
					</Form.Item>
					<Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
						<Input type="password" placeholder="Password" />
					</Form.Item>
					<Form.Item shouldUpdate>
						{() => (
							<Button type="primary" htmlType="submit">
								搜索
							</Button>
						)}
					</Form.Item>
				</Form>
			</Space>
			{/* </Flex> */}
			<Table className="mt-[20px]" rowKey="NodeId" columns={columns} dataSource={tableData} />
		</ContainerCard>
	);
};
export default AuditList;
