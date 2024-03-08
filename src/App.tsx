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
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AppAnt } from 'antd';
import type { Locale } from 'antd/es/locale';
// import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN';
import ThemeProvider from './styles/ThemeProvider';
import Login from '@/pages/auth/login';
import Layouts from '@/layouts';

function App() {
	const [locale] = useState<Locale>(zhCN);

	return (
		<AppAnt>
			<ConfigProvider locale={locale}>
				<ThemeProvider>
					<Router>
						<Routes>
							{/* 匹配 /login 路径时，只渲染 Login 组件，不使用 Layouts */}
							{/* AppAnt包裹, 定制design token才能对modal生效 */}
							<Route
								path="/login"
								element={
									<AppAnt>
										<Login />
									</AppAnt>
								}
							/>
							{/* 其他路径使用 Layouts 包裹 */}
							<Route
								path="/*"
								element={
									<AppAnt>
										<Layouts />
									</AppAnt>
								}
							/>
							{/* 跟路径重定向至home页 */}
							<Route path="/" element={<Navigate to="/login" replace />} />
						</Routes>
					</Router>
				</ThemeProvider>
			</ConfigProvider>
		</AppAnt>
	);
}

export default App;
