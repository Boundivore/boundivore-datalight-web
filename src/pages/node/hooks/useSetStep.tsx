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
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

const useSetStep = step => {
	const { stepCurrentTag } = useStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiSetProcedure = APIConfig.setProcedure;
	const setProcedure = () => {
		const params = {
			ClusterId: id,
			ProcedureStateEnum: step,
			Tag: stepCurrentTag
		};
		const data = RequestHttp.post(apiSetProcedure, params);
		console.log(data);
	};
	useEffect(() => {
		setProcedure();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};

export default useSetStep;
