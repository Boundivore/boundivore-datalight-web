import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { pollRequest } from '@/utils/helper';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

// import { useTranslation } from 'react-i18next';
// import RequestHttp from '@/api';
// import APIConfig from '@/api/config';

interface DataType {
	key: React.Key;
	name: string;
	age: number;
	address: string;
}

const columns: ColumnsType<DataType> = [
	{
		title: 'Name',
		dataIndex: 'name',
		render: (text: string) => <a>{text}</a>
	},
	{
		title: 'Age',
		dataIndex: 'age'
	},
	{
		title: 'Address',
		dataIndex: 'address'
	}
];

const data: DataType[] = [
	{
		key: '1',
		name: 'John Brown',
		age: 32,
		address: 'New York No. 1 Lake Park'
	},
	{
		key: '2',
		name: 'Jim Green',
		age: 42,
		address: 'London No. 1 Lake Park'
	},
	{
		key: '3',
		name: 'Joe Black',
		age: 32,
		address: 'Sydney No. 1 Lake Park'
	},
	{
		key: '4',
		name: 'Disabled User',
		age: 99,
		address: 'Sydney No. 1 Lake Park'
	}
];

// rowSelection object indicates the need for row selection
const rowSelection = {
	onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
		console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
	},
	getCheckboxProps: (record: DataType) => ({
		disabled: record.name === 'Disabled User', // Column configuration not to be checked
		name: record.name
	})
};
const InitNodeList: React.FC = () => {
	// const { t } = useTranslation();
	// const handleOk = () => {};
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiStatue = APIConfig.nodeInitList;
	const apiParse = APIConfig.parseHostname;
	const getStatus = () => {
		return RequestHttp.get(apiStatue, { ClusterId: id });
	};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getParse = async () => {
		const { data, code } = await RequestHttp.get(apiParse, { ClusterId: id });
		if (code) {
			const statusArr = pollRequest(getStatus, 0);
			data.map((dataItem: { id: string }) => {
				const matchItem = statusArr.find((statusItem: { id: string }) => {
					return statusItem.id === dataItem.id;
				});
				dataItem = { ...dataItem, status: matchItem.status };
				return dataItem;
			});
		}
	};
	useEffect(() => {
		getParse();
	}, [getParse]);
	return (
		<Table
			rowSelection={{
				...rowSelection
			}}
			columns={columns}
			dataSource={data}
		/>
	);
};

export default InitNodeList;
