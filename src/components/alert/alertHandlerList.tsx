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
 * 告警接口处理方式列表--多个类型
 * @author Tracy
 */
import { FC, Key, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { t } from 'i18next';
import { Table, Space, Button, message, App, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { AlertHandlerInterfaceVo, AlertHandlerMailVo } from '@/api/interface';

const ALERT_INTERFACE = 'ALERT_INTERFACE';
const ALERT_MAIL = 'ALERT_MAIL';
const useHandlerList = (api: string, handlerIdList: Key[], type: string) => {
	const [handlerList, setHandlerList] = useState<AlertHandlerInterfaceVo[] | AlertHandlerMailVo[]>([]);
	useEffect(() => {
		const getHandlerList = async () => {
			const params = { HandlerIdList: handlerIdList };
			const { Data } = await RequestHttp.post(api, params);
			let responseData;
			switch (type) {
				case ALERT_MAIL:
					responseData = Data.AlertHandlerMailList;
					break;
				case ALERT_INTERFACE:
					responseData = Data.AlertHandlerInterfaceList;
					break;
				default:
					responseData = [];
			}
			setHandlerList(responseData);
		};
		getHandlerList();
	}, [api, handlerIdList, type]);
	return handlerList;
};
const useDetachHandler = (type: string) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [messageApi] = message.useMessage();
	const { modal } = App.useApp();

	const detach = async (handlerIdList: Key[]) => {
		modal.confirm({
			title: t('detach'),
			content: t('detachConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.bindAlertAndAlertHandler;
				const idList = handlerIdList.map(handlerId => ({
					AlertHandlerTypeEnum: type,
					AlertId: id,
					HandlerId: handlerId,
					IsBinding: false
				}));
				const params = {
					HandlerId: idList
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					// callback && callback(); //操作成功更新列表
				}
			}
		});
	};

	return detach;
};
interface AlertHandlerTableProps {
	handlerIdList: Key[];
	api: string;
	type: string;
	columnsConfig: ColumnsType<AlertHandlerInterfaceVo> | ColumnsType<AlertHandlerMailVo>;
}
const AlertHandlerTable: FC<AlertHandlerTableProps> = ({ handlerIdList, api, type, columnsConfig }) => {
	const [selectedHandler, setSelectedHandler] = useState<Key[]>([]);
	const handlerList = useHandlerList(api, handlerIdList, type);
	// const [contextHolder] = message.useMessage();

	const detach = useDetachHandler(type);

	const rowSelection = {
		onChange: (selectedRowKeys: Key[]) => {
			setSelectedHandler(selectedRowKeys);
		},
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
	};
	return (
		<>
			{/* {contextHolder} */}
			<Flex justify="space-between">
				<Space>
					<Button type="primary" onClick={() => detach(selectedHandler)} disabled={!selectedHandler.length}>
						{t('batchDetach')}
					</Button>
				</Space>
			</Flex>
			<h4>{t('totalItems', { total: handlerList.length, selected: selectedHandler.length })}</h4>
			<Table
				rowSelection={{ ...rowSelection }}
				rowKey="HandlerId"
				dataSource={handlerList}
				columns={columnsConfig as ColumnsType<any>}
				pagination={{
					showSizeChanger: true,
					total: handlerList.length,
					showTotal: total => t('totalItems', { total, selected: selectedHandler.length })
				}}
			/>
		</>
	);
};
interface MailListProps {
	handlerIdList: string[] | number[];
}
export const MailList: FC<MailListProps> = ({ handlerIdList }) => {
	const api = APIConfig.getAlertHandlerMailListIdList;
	const detach = useDetachHandler(ALERT_MAIL);
	const buttonConfigItem = (record: AlertHandlerMailVo) => {
		const { HandlerId } = record;
		return [
			{
				id: 1,
				label: t('detach'),
				callback: () => detach([HandlerId]),
				disabled: false
			}
		];
	};
	const columns: ColumnsType<AlertHandlerMailVo> = [
		{
			title: t('id'),
			dataIndex: 'HandlerId',
			key: 'HandlerId'
		},
		{
			title: t('alert.mailAccount'),
			dataIndex: 'MailAccount',
			key: 'MailAccount'
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
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

	return <AlertHandlerTable handlerIdList={handlerIdList} api={api} type={ALERT_MAIL} columnsConfig={columns} />;
};
interface InterfaceListProps {
	handlerIdList: string[] | number[];
}
export const InterfaceList: FC<InterfaceListProps> = ({ handlerIdList }) => {
	const api = APIConfig.getAlertHandlerInterfaceListByIdList;
	const detach = useDetachHandler(ALERT_INTERFACE);
	const buttonConfigItem = (record: AlertHandlerInterfaceVo) => {
		const { HandlerId } = record;
		return [
			{
				id: 1,
				label: t('detach'),
				callback: () => detach([HandlerId]),
				disabled: false
			}
		];
	};

	const columns: ColumnsType<AlertHandlerInterfaceVo> = [
		{
			title: t('id'),
			dataIndex: 'HandlerId',
			key: 'HandlerId'
		},
		{
			title: t('alert.interfaceUri'),
			dataIndex: 'InterfaceUri',
			key: 'InterfaceUri'
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
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

	return <AlertHandlerTable handlerIdList={handlerIdList} api={api} type={ALERT_INTERFACE} columnsConfig={columns} />;
};
