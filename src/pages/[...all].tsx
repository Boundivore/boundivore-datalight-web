import React from 'react';
import { Result } from 'antd';

const NotFound: React.FC = () => <Result className="h-[90%]" status="404" title="404" subTitle="抱歉，该页面不存在。" />;

export default NotFound;
