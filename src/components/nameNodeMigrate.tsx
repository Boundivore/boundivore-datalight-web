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
 * NameNodeMigrate- NameNode迁移
 * @author Tracy
 */
import { FC, memo, useRef } from 'react';
import { Drawer, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import SelectNameNode from '@/components/nameNodeSteps/selectNameNode';
import SelectNewNode from '@/components/nameNodeSteps/selectNewNode';
import SelectZKFC from '@/components/nameNodeSteps/selectZKFC';
import MigrateList from '@/components/nameNodeSteps/migrateList';
import DiffConfigFile from '@/components/nameNodeSteps/diffConfigFile';
import useStore from '@/store/store';

const NameNodeMigrate: FC<{ isOpen: boolean; onClose: () => void; nameNodeList: []; zkfcList: [] }> = memo(
	({ isOpen, onClose, nameNodeList, zkfcList }) => {
		const { migrateStep, setMigrateStep } = useStore();
		const migrateRef = useRef<any>(null);
		const migrateDeploy = () => migrateRef.current?.deploy();
		const items: CollapseProps['items'] = [
			{
				key: '1',
				label:
					'第一步：选择 NameNode（请选择没有部署在任何节点的 NameNode 进行迁移，并确保另一组 NameNode 和 ZKFailoverController 为启动状态）',
				children: <SelectNameNode nameNodeList={nameNodeList} />
			},
			{
				key: '2',
				label:
					'第二步：选择 ZKFailoverController（请选择没有部署在任何节点的 ZKFailoverController 进行迁移，并确保另一组 NameNode 和 ZKFailoverController 为启动状态）',
				children: <SelectZKFC zkfcList={zkfcList} />
			},
			{
				key: '3',
				label: '第三步 选择迁移的目标节点',
				children: <SelectNewNode nextStep={migrateDeploy} />
			},
			{
				key: '4',
				label: '第四步 迁移部署进度',
				children: <MigrateList ref={migrateRef} />
			},
			{
				key: '5',
				label: '第五步 同步最新的配置文件',
				children: <DiffConfigFile />
			}
		];
		const handleChange = (key: string[]) => {
			setMigrateStep(key);
		};

		return (
			<Drawer width="90%" onClose={onClose} open={isOpen}>
				<Collapse items={items} activeKey={migrateStep} onChange={key => handleChange(key)} />
			</Drawer>
		);
	}
);
export default NameNodeMigrate;
