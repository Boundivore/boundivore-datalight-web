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
 * 修改配置文件页面
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useSearchParams } from 'react-router-dom';
import { Tabs, Card, Col, Row, Space, Dropdown } from 'antd';
// import RequestHttp from '@/api';
// import APIConfig from '@/api/config';
import mockData from './mockData/tempData.json';
import DiffViewer from './codeEditor';

const ModifyConfig: React.FC = () => {
	// const { t } = useTranslation();
	// const [searchParams] = useSearchParams();
	// const id = searchParams.get('id');
	// const serviceName = searchParams.get('name');
	const [tabsData, setTabsData] = useState([]);
	const [activeTab, setActiveTab] = useState('');
	const [activeContent, setActiveContent] = useState({});

	const getConfigFile = async () => {
		// setLoading(true);
		// const api = APIConfig.listSummary;
		// const params = { ClusterId: id, ServiceName: serviceName };
		// const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigSummaryList }
		} = mockData.tabs; // TODO 年后调整为接口获取

		const tempData = ConfigSummaryList.map(item => {
			item.key = item.FileName;
			item.label = item.FileName;
			return item;
		});
		// setLoading(false);
		setActiveTab(tempData[0].FileName); // 默认选中第一项
		setTabsData(tempData);
	};
	const getFileContent = async () => {
		// setLoading(true);
		// const api = APIConfig.listByGroup;
		// const { configPath } = tabsData.find(item => {
		// 	return item.key === activeTab;
		// });
		// const params = { ClusterId: id, ServiceName: serviceName, Filename: activeTab, ConfigPath: configPath };
		// const data = await RequestHttp.get(api, { params });
		// console.log(data);
		const {
			Data: { ConfigGroupList }
		} = mockData.content; // TODO 年后调整为接口获取
		// setLoading(false);
		setActiveContent(ConfigGroupList);
		console.log(activeContent);
	};
	useEffect(() => {
		getConfigFile();
	}, []);
	useEffect(() => {
		getFileContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]);
	const originalText = 'Hello, this is the original text.';
	const modifiedText = 'Hello, this is the modified tet.';
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			<Tabs items={tabsData} />
			{/* <div>{activeContent}</div> */}
			<Row>
				<Col span={8}>
					<Space>
						<Dropdown.Button></Dropdown.Button>
					</Space>
				</Col>
				<Col span={16}>
					<DiffViewer originalText={originalText} modifiedText={modifiedText} />
				</Col>
			</Row>
		</Card>
	);
};

export default ModifyConfig;
