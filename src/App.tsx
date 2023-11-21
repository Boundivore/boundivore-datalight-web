import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import type { Locale } from 'antd/es/locale';
// import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import Router from '@/routers/index';
import ThemeProvider from './styles/ThemeProvider';
// import './App.css';

function App() {
	const [locale] = useState<Locale>(zhCN);

	return (
		<ConfigProvider locale={locale}>
			<ThemeProvider>
				<RouterProvider router={Router} />
			</ThemeProvider>
		</ConfigProvider>
	);
}

export default App;
