import { forwardRef } from 'react';
import { Card, CardProps } from 'antd';

const ContainerCard = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
	const { children, className, ...rest } = props;
	return (
		<Card className={`min-h-[calc(100%-100px)] m-[20px] ${className}`} {...rest} ref={ref}>
			{children}
		</Card>
	);
});

export default ContainerCard;
