import * as React from 'react';
import { ConfigProvider } from 'antd';
import useSwitchStyle from './switchStyle';
// import { background } from './gradientUtil';
import './theme.css';
// import { PREFIX } from './constant';

export interface ThemeProviderProps {
	disabled?: boolean;
	children?: React.ReactNode;
}
export default function ThemeProvider(props: ThemeProviderProps) {
	const { children } = props;

	const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);

	// Switch
	useSwitchStyle(getPrefixCls(`switch`));
	// useLayoutStyle(getPrefixCls(`switch`));

	// const passedCls = disabled ? null : PREFIX;

	return (
		<ConfigProvider
			theme={{
				components: {
					Layout: {
						/* here is your component tokens */
						headerBg: '#fff',
						footerBg: '#fff',
						boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)'
					}
				}
			}}
			layout={{ className: 'my-layout' }}
			// switch={{ className: 'my-header' }}
			// typography={{ className: passedCls }}
			// checkbox={{ className: passedCls }}
			// radio={{ className: passedCls }}
			// spin={{ className: passedCls }}
			// divider={{ className: passedCls }}
			// card={{ className: passedCls }}
		>
			{children}
		</ConfigProvider>
	);
}
