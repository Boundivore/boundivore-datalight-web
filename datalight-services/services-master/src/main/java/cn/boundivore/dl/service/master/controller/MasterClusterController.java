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
package cn.boundivore.dl.service.master.controller;

import cn.boundivore.dl.api.master.define.IMasterClusterAPI;
import cn.boundivore.dl.base.enumeration.impl.ClusterTypeEnum;
import cn.boundivore.dl.base.request.impl.master.AbstractClusterRequest;
import cn.boundivore.dl.base.response.impl.master.AbstractClusterVo;
import cn.boundivore.dl.base.result.Result;
import cn.boundivore.dl.service.master.service.MasterClusterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

/**
 * Description: MasterClusterController
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2023/3/30
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
@RestController
@RequiredArgsConstructor
public class MasterClusterController implements IMasterClusterAPI {

    private final MasterClusterService masterClusterServices;


    @Override
    public Result<AbstractClusterVo.ClusterVo> clusterNew(AbstractClusterRequest.ClusterNewRequest request) throws Exception {
        return masterClusterServices.clusterNew(request);
    }

    @Override
    public Result<AbstractClusterVo.ClusterVo> getClusterById(Long clusterId) throws Exception {
        return masterClusterServices.getClusterById(clusterId);
    }

    @Override
    public Result<AbstractClusterVo.ClusterListVo> getByClusterType(ClusterTypeEnum clusterTypeEnum) throws Exception {
        return masterClusterServices.getByClusterType(clusterTypeEnum);
    }

    @Override
    public Result<AbstractClusterVo.ClusterListVo> getComputeClusterListByRelativeClusterId(Long clusterId) throws Exception {
        return masterClusterServices.getComputeClusterListByRelativeClusterId(clusterId);
    }

    @Override
    public Result<AbstractClusterVo.ClusterVo> getClusterRelative(Long clusterId) throws Exception {
        return masterClusterServices.getClusterRelative(clusterId);
    }
}