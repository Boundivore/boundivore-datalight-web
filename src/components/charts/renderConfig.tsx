import { FC, memo } from 'react';
import { Space, Row, Col, Card } from 'antd';
import { DataStructure, Column } from '@/api/interface';
import GaugeComponent from '@/components/charts/gauge';
import LineComponent from '@/components/charts/line';
import TextComponent from '@/components/charts/text';

const componentMap = {
	gauge: GaugeComponent,
	text: TextComponent,
	time: TextComponent,
	number: TextComponent,
	byte: TextComponent,
	self: TextComponent,
	line: LineComponent
	// 其他类型组件...
};
interface RenderComponentProps extends Column {
	clusterId: string;
}
export const RenderComponent: FC<RenderComponentProps> = memo(props => {
	const ComponentToRender = componentMap[props.type] || null; // 获取对应的组件类型，如果找不到则返回null
	return ComponentToRender ? <ComponentToRender {...props} /> : null;
});
interface RenderConfigProps {
	config: DataStructure[];
	selectCluster: string;
}
export const RenderConfig: FC<RenderConfigProps> = ({ config, selectCluster }) => {
	return (
		<Space direction="vertical" className="flex">
			{config.map(item => (
				<Row style={{ height: `${item.height}` }} key={item.key} gutter={8} wrap={false}>
					{item.cols.map(col => (
						<Col key={col.key} span={col.span}>
							{col.rows ? (
								<Space direction="vertical" className="flex" key={`${col.key}-space`}>
									{col.rows.map(row => {
										return (
											// <Row>
											<Card style={{ height: '170px' }} key={row.key}>
												<span>{row.title}</span>
												<RenderComponent {...row} clusterId={selectCluster} />
											</Card>
											// </Row>
										);
									})}
								</Space>
							) : (
								<Card style={{ height: `${item.height}` }} key={col.key}>
									<span>{col.title}</span>
									<RenderComponent {...col} clusterId={selectCluster} />
								</Card>
							)}
						</Col>
					))}
				</Row>
			))}
		</Space>
	);
};
