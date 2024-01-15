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
import { useState } from 'react';
import { ConfigProvider, App as AppAnt } from 'antd';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import type { Locale } from 'antd/es/locale';
// import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN';
import ThemeProvider from './styles/ThemeProvider';

function App() {
	const [locale] = useState<Locale>(zhCN);

	return (
		<AppAnt>
			<ConfigProvider locale={locale}>
				<ThemeProvider>{useRoutes(routes)}</ThemeProvider>
			</ConfigProvider>
		</AppAnt>
	);
}

export default App;
