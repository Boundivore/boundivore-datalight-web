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
 * CurrentCluster - 当前已选择的集群
 * @param {function} callback - 引用组件时传入的回调函数，用于定制引用组件的不同场景
 * @author Tracy
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { updateCurrentView } from '@/utils/helper';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { ClusterType } from '@/api/interface';

const useCurrentCluster = (callback?: (allowAdd: boolean) => void) => {
	const { t } = useTranslation();
	const [selectData, setSelectData] = useState<SelectProps['options']>([]);
	const [selectCluster, setSelectCluster] = useState<string>('');
	const getClusterList = async () => {
		const api = APIConfig.getClusterList;
		const data = await RequestHttp.get(api);
		const clusterList: ClusterType[] = data.Data.ClusterList;
		const listData = clusterList.map(item => ({
			value: item.ClusterId,
			label: item.ClusterName,
			hasAlreadyNode: item.HasAlreadyNode
		}));
		setSelectData(listData);

		const currentViewCluster = clusterList.find(cluster => cluster.IsCurrentView === true);
		if (currentViewCluster) {
			// 如果找到了，设置setSelectCluster为该项的ClusterId
			setSelectCluster(currentViewCluster.ClusterId);
			callback && callback(!currentViewCluster.HasAlreadyNode);
		} else {
			// 如果没有找到，则使用第一项的ClusterId
			clusterList.length > 0 ? setSelectCluster(clusterList[0].ClusterId) : setSelectCluster(''); // 确保数组不为空
			clusterList.length > 0 ? callback && callback(!clusterList[0].HasAlreadyNode) : callback && callback(false); // 确保数组不为空
		}
	};

	const handleChange = async (value: string, option: DefaultOptionType | DefaultOptionType[]) => {
		await updateCurrentView(value);
		setSelectCluster(value);
		if (Array.isArray(option)) {
			// 如果 option 是数组，则处理数组中的第一个元素
			callback && callback(!option[0].hasAlreadyNode);
		} else {
			// 如果 option 不是数组，则直接处理
			callback && callback(!option.hasAlreadyNode);
		}
	};

	useEffect(() => {
		getClusterList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		selectData,
		selectCluster,
		clusterComponent: (
			<div>
				<span>{t('node.currentCluster')}</span>
				<Select className="w-[200px]" options={selectData} value={selectCluster} onChange={handleChange} />
			</div>
		)
	};
};
export default useCurrentCluster;
