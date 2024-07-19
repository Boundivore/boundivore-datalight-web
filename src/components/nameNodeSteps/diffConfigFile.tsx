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
 * DiffConfigFile - 对比配置文件
 * @author Tracy
 */
import { FC, useEffect, useState } from 'react';
import { Space, Button, Popover, List, message, Empty } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import _ from 'lodash';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { t } from 'i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
// import { ConfigSummaryVo } from '@/api/interface';

const DiffConfigFile: FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [newCode, setNewCode] = useState('');
	const [oldCode, setOldCode] = useState('');
	const [configGroup, setConfigGroup] = useState([]);
	const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
	const [groupNodeList, setGroupNodeList] = useState([]);
	const [messageApi, contextHolder] = message.useMessage();
	const getConfigFile = async () => {
		// setLoading(true);
		const api = APIConfig.listSummary;
		const params = { ClusterId: id, ServiceName: 'HDFS' };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigSummaryList }
		} = data;

		const { ConfigPath } = ConfigSummaryList?.find(item => item.FileName === 'hdfs-site.xml') ?? {};
		getOldFileContent(ConfigPath);
	};
	const getOldFileContent = async configPath => {
		const api = APIConfig.listByGroup;

		const params = { ClusterId: id, ServiceName: 'HDFS', Filename: 'hdfs-site.xml', ConfigPath: configPath };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ConfigGroupList }
		} = data;
		// setLoading(false);
		// paramData = ConfigGroupList;
		const copyData = _.cloneDeep(ConfigGroupList);
		const codeData = Utf8.stringify(Base64.parse(copyData[0].ConfigData));
		const configNodeList = copyData[currentGroupIndex].ConfigNodeList;
		setOldCode(codeData);
		setConfigGroup(copyData);
		setGroupNodeList(configNodeList);
	};
	const getNewHdfsSiteConfigListByGroup = async () => {
		const api = APIConfig.getNewHdfsSiteConfigListByGroup;
		const params = {
			ClusterId: id
		};
		try {
			const {
				Code,
				Data: { ConfigGroupList }
			} = await RequestHttp.get(api, { params });
			if (Code === '00000') {
				const copyData = _.cloneDeep(ConfigGroupList);
				const codeData = Utf8.stringify(Base64.parse(copyData[0].ConfigData));
				setNewCode(codeData);
				getConfigFile();
			}
		} catch (error) {
			console.log(error);
		}
	};
	const saveChange = async () => {
		const api = APIConfig.saveByGroup;
		const editorValue = newCode;
		const base64Data = btoa(unescape(encodeURIComponent(editorValue)));
		const hashDigest = sha256(editorValue).toString(CryptoJS.enc.Hex);
		_.merge(configGroup[currentGroupIndex], { Sha256: hashDigest, ConfigData: base64Data });
		const params = {
			ClusterId: id,
			ConfigGroupList: configGroup,
			ServiceName: 'HDFS'
		};
		const data = await RequestHttp.post(api, params);
		const { Code } = data;
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			// navigateToService();
		}
	};
	useEffect(() => {
		getNewHdfsSiteConfigListByGroup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
			{contextHolder}
			{newCode ? (
				<>
					<Space>
						{configGroup.map((_group, index) => {
							return (
								<Space key={index}>
									<Popover
										content={
											<List
												size="small"
												// header={<div>Header</div>}
												// footer={<div>Footer</div>}
												bordered
												dataSource={groupNodeList}
												renderItem={item => <List.Item>{item.Hostname}</List.Item>}
											/>
										}
										title="Title"
									>
										<Button
											key={index}
											size="middle"
											type={index === currentGroupIndex ? 'primary' : 'default'}
											shape="round"
											onClick={() => {
												setCurrentGroupIndex(index);
												// setCodeEdit(Utf8.stringify(Base64.parse(activeContent[index].ConfigData)));
											}}
										>
											{t('group', { name: index + 1 })}
										</Button>
									</Popover>
									{/* <PlusCircleOutlined style={{ fontSize: '16px' }} onClick={() => handleClick(index)} /> */}
								</Space>
							);
						})}

						<Button type="primary" onClick={saveChange}>
							同步最新配置文件
						</Button>
					</Space>
					<ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} />
				</>
			) : (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
					<Button
						type="primary"
						icon={<RedoOutlined />}
						//   loading={loadings[2]}
						onClick={getNewHdfsSiteConfigListByGroup}
					>
						刷新
					</Button>
				</Empty>
			)}
		</>
	);
};
export default DiffConfigFile;
