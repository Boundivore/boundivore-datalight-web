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
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Collapse, Flex, Select } from 'antd';
// import { useTranslation } from 'react-i18next';
// import type { CollapseProps } from 'antd';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import NodeListModal from './components/nodeListModal';

const SelectComStep: React.FC = forwardRef((props, ref) => {
	const { selectedRowsList } = useStore();
	const [serviceList, setServiceList] = useState([]);
	const [serviceNames, setServiceNames] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentComponent, setCurrentComponent] = useState('');
	// const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiSelect = APIConfig.selectService;
		const params = {
			ClusterId: id,
			ServiceList: selectedRowsList.map(({ SCStateEnum, ServiceName }) => ({ SCStateEnum, ServiceName }))
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};
	const handleFocus = (componentName: string) => {
		setIsModalOpen(true);
		setCurrentComponent(componentName);
	};
	const handleModalOk = () => {
		setIsModalOpen(false);
	};

	const handleModalCancel = () => {
		setIsModalOpen(false);
	};

	const getList = async () => {
		const apiList = APIConfig.componentList;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		const componentList = data.Data.ServiceComponentSummaryList;
		const transformedData = componentList.map(item => {
			return {
				...item.ServiceSummary,
				ComponentSummaryList: item.ComponentSummaryList
			};
		});
		console.log(555, transformedData);
		const cdata = transformedData.map(item => ({
			key: item.ServiceName,
			label: item.ServiceName,
			children: (
				<Flex wrap="wrap">
					{item.ComponentSummaryList.map(component => {
						return (
							<div className="w-1/4">
								<p>{component.ComponentName}</p>
								<Select
									defaultValue={[1]}
									mode="multiple"
									className="w-4/5"
									onFocus={() => handleFocus(component.ComponentName)}
								/>
							</div>
						);
					})}
				</Flex>
			)
		}));
		const serviceNamesList = transformedData.map(item => item.ServiceName);
		console.log(666, serviceNamesList);
		setServiceNames(serviceNamesList);
		setServiceList(cdata);
	};
	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
			<Collapse items={serviceList} activeKey={serviceNames} />
			{isModalOpen ? (
				<NodeListModal
					component={currentComponent}
					isModalOpen={isModalOpen}
					handleOk={handleModalOk}
					handleCancel={handleModalCancel}
				/>
			) : null}
		</>
	);
});
export default SelectComStep;
