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
import { useTranslation } from 'react-i18next';

interface ItemConfigInfoProps {
	text: string;
	record: any;
}

const ItemConfigInfo: React.FC<ItemConfigInfoProps> = ({ text, record }) => {
	const { t } = useTranslation();

	return (
		<a>
			{text}
			{t('node.core')} /&nbsp;{(record?.Ram / 1024).toFixed(2)}
			{t('node.gb')} /&nbsp;{(record?.DiskTotal / 1024).toFixed(2)}
			{t('node.gb')} {record.CpuArch ? `/ ${record.CpuArch}` : null}
		</a>
	);
};

export default ItemConfigInfo;
