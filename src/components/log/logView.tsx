import { FC, useState, useEffect, useRef } from 'react';
import { List, Button } from 'antd';
import { RedoOutlined } from '@ant-design/icons';

const fetchMoreLogs = startId => {
	// 模拟异步加载更多日志
	return new Array(5).fill(null).map((_, index) => ({
		id: startId + index,
		timestamp: `2023-01-01 12:0${startId + index}:00`,
		message: `Log message ${startId + index}`,
		level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)]
	}));
};

const LogViewer: FC = ({ data, handleScroll }) => {
	const [logs, setLogs] = useState(data);
	const [loading, setLoading] = useState(false);
	const [markedLogIds, setMarkedLogIds] = useState([]);
	const divRef = useRef(null);

	const loadMoreData = () => {
		setLoading(true);
		setTimeout(() => {
			const moreLogs = fetchMoreLogs(logs.length + 1);
			setLogs([...logs, ...moreLogs]);
			setLoading(false);
		}, 1000);
	};

	const markLog = id => {
		setMarkedLogIds(prev => (prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]));
	};
	useEffect(() => {
		setLogs(data);
	}, [data]);

	return (
		<div
			ref={divRef}
			style={{ height: '400px', overflow: 'auto', padding: '16px', border: '1px solid #ddd' }}
			// onScroll={({ scrollOffsetToBottom }) => handleScroll(scrollOffsetToBottom)}
			onScroll={() => {
				const { scrollHeight, scrollTop, clientHeight } = divRef.current;
				handleScroll(scrollHeight, scrollTop, clientHeight);
			}}
		>
			<List
				dataSource={logs}
				renderItem={item => (
					<List.Item
						key={item}
						style={{ backgroundColor: markedLogIds.includes(item) ? '#ffc' : 'white' }}
						onClick={() => markLog(item)}
					>
						<List.Item.Meta title={item} />
					</List.Item>
				)}
			>
				{loading && (
					<div style={{ textAlign: 'center', padding: '12px 0' }}>
						<RedoOutlined spin /> Loading...
					</div>
				)}
				{!loading && (
					<div style={{ textAlign: 'center', padding: '12px 0' }}>
						<Button onClick={loadMoreData}>Load More</Button>
					</div>
				)}
			</List>
		</div>
	);
};

export default LogViewer;
