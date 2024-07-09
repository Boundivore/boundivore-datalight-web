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
 * SelectNewNode- 选择要迁移到的新节点, 第三步
 * @author Tracy
 */
import React from 'react';
import { Flex, Select } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ComponentSummaryVo } from '@/api/interface';
import useStore from '@/store/store';
const SelectNewNode: React.FC = () => {
	const { selectedNameNode } = useStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	let tempList = { [id]: {} };
	return (
		<Flex wrap="wrap">
			{selectedNameNode.map((component: ComponentSummaryVo) => {
				tempList[id] = {
					...tempList[id],
					[component.ComponentName]: {
						componentNodeList: component.ComponentNodeList,
						min: component.Min,
						max: component.Max
					}
				};
				// setNodeList(tempList);
				const nameArray = tempList[id][component.ComponentName].componentNodeList
					?.filter((serviceItem: ServiceItemType) => serviceItem.SCStateEnum !== 'UNSELECTED')
					.map((node: NodeType) => node.Hostname);
				return (
					<div className="w-1/4" key={component.ComponentName}>
						<p>{component.ComponentName}</p>
						<Select
							value={nameArray}
							mode="multiple"
							maxTagTextLength={8}
							maxTagCount={8}
							className="w-4/5"
							dropdownStyle={{ display: 'none' }} // 不显示下拉菜单
							// tagRender={customTagRender}
							// onFocus={() => handleFocus(component.ComponentName, disableSelected)}
						/>
					</div>
				);
			})}
		</Flex>
	);
};
export default SelectNewNode;
