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
// customModal.tsx

import React, { ReactNode, useState } from 'react';
import { Modal, ModalProps } from 'antd';

interface CustomModalProps extends ModalProps {
	title: ReactNode;
	content: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ title, content }) => {
	const [open, setOpen] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const handleOk = () => {
		// setConfirmLoading(true);
		// setTimeout(() => {
		setOpen(false);

		setConfirmLoading(false);
		// }, 2000);
	};

	const handleCancel = () => {
		setOpen(false);
	};
	return (
		<Modal open={open} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel}>
			{title && <div className="modal-title">{title}</div>}
			{content}
		</Modal>
	);
};

export default CustomModal;
