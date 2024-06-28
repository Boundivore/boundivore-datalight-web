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
import { Space, Input, Form, Button, Table, DatePicker, Select } from 'antd';
import type { TableColumnsType } from 'antd';
import { t } from 'i18next';
import useNavigater from '@/hooks/useNavigater';
import ContainerCard from '@/components/containerCard';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { AuditLogSimpleVo } from '@/api/interface';

const { RangePicker } = DatePicker;

enum LogType {
	Master = 'MASTER',
	Worker = 'WORKER'
}
interface FieldType {
	Ip?: string;
	LogType?: LogType;
	OpName?: string;
	Principal?: string;
	Uri?: string;
	UserId?: number;
	RangeTime?: Date[];
	StartTs?: number;
	EndTs?: number;
}
const convertObject = (obj: FieldType) => {
	// 创建一个新对象来存储结果
	const newObj = { ...obj }; // 使用扩展运算符复制所有属性

	// 如果对象包含RangeTime属性，则进行转换
	if (obj.RangeTime && Array.isArray(newObj.RangeTime) && newObj.RangeTime.length === 2) {
		const [startTimeString, endTimeString] = newObj.RangeTime;
		const startTimestamp = new Date(startTimeString).getTime();
		const endTimestamp = new Date(endTimeString).getTime();

		newObj.StartTs = startTimestamp;
		newObj.EndTs = endTimestamp;
	}
	// 删除RangeTime属性，并添加StartTs和EndTs属性
	delete newObj.RangeTime;
	return newObj;
};

const AuditList: FC = () => {
	const [form] = Form.useForm();
	const [tableData, setTableData] = useState([]);

	const [defaultParams, setDefaultParams] = useState({
		CurrentPage: 1,
		PageSize: 10
	});

	const [pagination, setPagination] = useState({
		total: 0,
		page: defaultParams.CurrentPage,
		pageSize: defaultParams.PageSize
	});
	const { navigateToAuditDetail } = useNavigater();
	// 单条操作按钮配置
	const buttonConfigItem = (record: AuditLogSimpleVo) => {
		return [
			{
				id: 1,
				label: t('detail'),
				callback: () => navigateToAuditDetail(record.AuditLogId),
				disabled: false
			}
		];
	};
	const columns: TableColumnsType<AuditLogSimpleVo> = [
		{
			title: t('audit.opName'),
			dataIndex: 'OpName',
			key: 'OpName'
		},
		{
			title: t('userId'),
			dataIndex: 'UserId',
			key: 'UserId',
			render: text => {
				return text || '--';
			}
		},
		{
			title: t('audit.principal'),
			dataIndex: 'Principal',
			key: 'Principal',
			render: text => {
				return text || '--';
			}
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
	const getList = async (values = {}) => {
		const api = APIConfig.getAuditLogSimpleList;
		const params = {
			...defaultParams,
			...values
		};
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { AuditLogSimpleList },
			Page: { TotalSize, CurrentPage, PageSize }
		} = data;
		setPagination({
			page: CurrentPage,
			pageSize: PageSize,
			total: TotalSize
		});
		setTableData(AuditLogSimpleList);
	};
	const onFinish = (values: FieldType) => {
		const convertedObject = convertObject(values);
		const mergeObject = {
			...defaultParams,
			...convertedObject
		};
		// getList(mergeObject);
		setDefaultParams(mergeObject);
	};
	const onReset = () => {
		setDefaultParams({
			CurrentPage: 1,
			PageSize: 10
		});
		// getList();
	};

	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultParams]);
	return (
		<ContainerCard>
			<Form form={form} name="horizontal_login" layout="inline" onFinish={onFinish}>
				<Space wrap>
					<Form.Item name="OpName">
						<Input placeholder={t('audit.opName')} />
					</Form.Item>
					<Form.Item name="UserId">
						<Input placeholder={t('userId')} />
					</Form.Item>
					<Form.Item name="Principal">
						<Input placeholder={t('audit.principal')} />
					</Form.Item>
					<Form.Item name="LogType">
						<Select
							placeholder={t('audit.logType')}
							style={{ width: 120 }}
							allowClear
							options={[
								{ value: 'MASTER', label: 'MASTER' },
								{ value: 'WORKER', label: 'WORKER' }
							]}
						/>
					</Form.Item>
					<Form.Item name="Ip">
						<Input placeholder={t('audit.ip')} />
					</Form.Item>
					<Form.Item name="RangeTime">
						<RangePicker showTime />
					</Form.Item>
					<Form.Item shouldUpdate>
						{() => {
							return (
								<Space>
									<Button type="primary" htmlType="submit">
										{t('search')}
									</Button>
									<Button type="primary" htmlType="reset" onClick={onReset}>
										{t('reset')}
									</Button>
								</Space>
							);
						}}
					</Form.Item>
				</Space>
			</Form>
			<Table
				className="mt-[20px]"
				rowKey="AuditLogId"
				columns={columns}
				dataSource={tableData}
				pagination={{
					current: pagination.page,
					total: pagination.total,
					showSizeChanger: true,
					showQuickJumper: true,
					onChange: (page, pageSize) => {
						getList({
							CurrentPage: page,
							PageSize: pageSize
						});
					}
				}}
			/>
		</ContainerCard>
	);
};
export default AuditList;
