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
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Card, Col, Row, Space, Button, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import sha256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';
// import mockData from './mockData/tempData.json';
import CodeEditor from './codeEditor';
import NodeListModal from './components/nodeListModal';

const ModifyConfig: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const serviceName = searchParams.get('name');
	const [tabsData, setTabsData] = useState([]);
	const [activeTab, setActiveTab] = useState('');
	const [activeMode, setActiveMode] = useState('');
	const [activeContent, setActiveContent] = useState({});
	const [codeEdit, setCodeEdit] = useState('');
	// const [groupList, setGroupList] = useState([]);
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { configGroupInfo, setConfigGroupInfo } = useStore();
	const [messageApi, contextHolder] = message.useMessage();
	const { navigateToService } = useNavigater();

	const editorRef = useRef(null);

	let paramData = null; // 最终保存修改时提交的数据

	const getConfigFile = async () => {
		// setLoading(true);
		const api = APIConfig.listSummary;
		const params = { ClusterId: id, ServiceName: serviceName };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigSummaryList }
		} = data;

		const tempData = ConfigSummaryList.map(item => {
			item.key = item.FileName;
			item.label = item.FileName;
			return item;
		});
		// setLoading(false);
		setActiveTab(tempData[0].FileName); // 默认选中第一项
		const fileExtension = tempData[0].FileName.split('.').pop();
		setActiveMode(fileExtension);
		setTabsData(tempData);
	};
	const getFileContent = async () => {
		// setLoading(true);
		const api = APIConfig.listByGroup;
		const { ConfigPath } = tabsData.find(item => {
			return item.key === activeTab;
		});
		const params = { ClusterId: id, ServiceName: serviceName, Filename: activeTab, ConfigPath };
		const data = await RequestHttp.get(api, { params });
		console.log(data);
		const {
			Data: { ConfigGroupList }
		} = data;
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		getFileContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]);
	const handleClick = () => {
		setIsModalOpen(true);
		// changeFile(currentIndex);
	};
	const handleModalOk = () => {
		// 新建分组，添加到其他分组
		setIsModalOpen(false);
		// changeFile();
		setCurrentGroupIndex(currentGroupIndex || configGroupInfo.length); // 移动时定位到currentIndex，新建时定位到最后一个分组
	};
	const handleModalCancel = () => {
		setIsModalOpen(false);
	};
	const changeFile = () => {
		if (editorRef.current) {
			const editorValue = editorRef.current.editor.getValue();
			const base64Data = btoa(editorValue);
			const hashDigest = sha256(editorValue).toString(CryptoJS.enc.Hex);
			setConfigGroupInfo([
				...configGroupInfo,
				{
					...configGroupInfo[currentGroupIndex],
					Sha256: hashDigest,
					ConfigData: base64Data
				}
			]);
		}
		setCurrentGroupIndex(currentGroupIndex || configGroupInfo.length); // 移动时定位到currentIndex，新建时定位到最后一个分组
	};
	const saveChange = async () => {
		const api = APIConfig.saveByGroup;
		const editorValue = editorRef.current.editor.getValue();
		const base64Data = btoa(unescape(encodeURIComponent(editorValue)));
		const hashDigest = sha256(editorValue).toString(CryptoJS.enc.Hex);
		_.merge(configGroupInfo[currentGroupIndex], { Sha256: hashDigest, ConfigData: base64Data });
		const params = {
			ClusterId: id,
			ConfigGroupList: configGroupInfo,
			ServiceName: serviceName
		};
		const data = await RequestHttp.post(api, params);
		const { Code } = data;
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			navigateToService();
		}
	};

	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			{contextHolder}
			<Tabs
				items={tabsData}
				onChange={activeKey => {
					setActiveTab(activeKey);
					const fileExtension = activeKey.split('.').pop();
					setActiveMode(fileExtension);
				}}
			/>
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
					{codeEdit ? <CodeEditor editorRef={editorRef} data={codeEdit} mode={activeMode} changeFile={changeFile} /> : null}
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
					<Button type="primary" onClick={saveChange}>
						{t('save')}
					</Button>
				</Space>
			</div>
		</Card>
	);
};

export default ModifyConfig;
