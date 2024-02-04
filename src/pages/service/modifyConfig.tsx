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
import { useTranslation } from 'react-i18next';
// import { useSearchParams } from 'react-router-dom';
import { Tabs, Card, Col, Row, Space, Button } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
// import RequestHttp from '@/api';
// import APIConfig from '@/api/config';
import useStore from '@/store/store';
import mockData from './mockData/tempData.json';
import CodeEditor from './codeEditor';
import NodeListModal from './components/nodeListModal';

const ModifyConfig: React.FC = () => {
	const { t } = useTranslation();
	// const [searchParams] = useSearchParams();
	// const id = searchParams.get('id');
	// const serviceName = searchParams.get('name');
	const [tabsData, setTabsData] = useState([]);
	const [activeTab, setActiveTab] = useState('');
	const [activeContent, setActiveContent] = useState({});
	const [codeEdit, setCodeEdit] = useState('');
	// const [groupList, setGroupList] = useState([]);
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { configGroupInfo, setConfigGroupInfo } = useStore();

	let paramData = null; // 最终保存修改时提交的数据

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
		paramData = ConfigGroupList;
		console.log(paramData);
		const copyData = _.cloneDeep(ConfigGroupList);
		const codeData = atob(copyData[0].ConfigData);
		setActiveContent(copyData);
		setCodeEdit(codeData);
		// setGroupList(copyData);
		setConfigGroupInfo(copyData);
		console.log(activeContent);
	};
	useEffect(() => {
		getConfigFile();
	}, []);
	useEffect(() => {
		getFileContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]);
	const handleClick = (index: Number) => {
		setIsModalOpen(true);
		setCurrentGroupIndex(index);
	};
	const handleModalOk = () => {
		// 新建分组，添加到其他分组
		setIsModalOpen(false);
		setCurrentGroupIndex(configGroupInfo.length); // TODO 这里还需要考虑移动的情况
	};
	const handleModalCancel = () => {
		setIsModalOpen(false);
	};

	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			<Tabs items={tabsData} />
			{/* <div>{activeContent}</div> */}
			<Row>
				<Col span={8}>
					<Space direction="vertical">
						{configGroupInfo.map((_group, index) => {
							return (
								<Space>
									<Button
										key={index}
										size="middle"
										type={index === currentGroupIndex ? 'primary' : 'default'}
										shape="round"
										onClick={() => setCurrentGroupIndex(index)}
									>
										{t('group', { name: index + 1 })}
									</Button>
									<PlusCircleOutlined style={{ fontSize: '16px' }} onClick={() => handleClick(index)} />
								</Space>
							);
						})}
					</Space>
				</Col>
				<Col className="min-h-[500px]" span={16}>
					{codeEdit ? <CodeEditor data={codeEdit} /> : null}
				</Col>
			</Row>
			{isModalOpen ? (
				<NodeListModal
					isModalOpen={isModalOpen}
					groupIndex={currentGroupIndex}
					handleOk={handleModalOk}
					handleCancel={handleModalCancel}
				/>
			) : null}
			<div className="bottom-0 bg-white p-4 shadow-md">
				<Space>
					<Button>{t('cancel')}</Button>
					<Button type="primary">{t('save')}</Button>
				</Space>
			</div>
		</Card>
	);
};

export default ModifyConfig;
