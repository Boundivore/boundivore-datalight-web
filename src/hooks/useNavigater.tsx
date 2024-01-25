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
/**
 * useNavigater - 自定义Hook
 * 将系统中用到的跳转收敛到这里
 * @author Tracy.Guo
 */
import { useNavigate } from 'react-router-dom';

const useNavigater = () => {
	const navigate = useNavigate();

	const navigateToLogin = () => {
		navigate('/login');
	};
	const navigateToHome = () => {
		navigate('/home');
	};
	const navigateToClusterList = () => {
		navigate('/home'); // 当前home及集群列表页
	};
	const navigateToNodeList = () => {
		navigate('/node/list');
	};

	return { navigateToLogin, navigateToHome, navigateToClusterList, navigateToNodeList };
};

export default useNavigater;
