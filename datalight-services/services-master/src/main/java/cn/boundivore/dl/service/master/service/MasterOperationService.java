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
package cn.boundivore.dl.service.master.service;

import cn.boundivore.dl.base.enumeration.impl.ActionTypeEnum;
import cn.boundivore.dl.base.enumeration.impl.SCStateEnum;
import cn.boundivore.dl.base.request.IRequest;
import cn.boundivore.dl.base.request.impl.master.JobDetailRequest;
import cn.boundivore.dl.base.request.impl.master.JobRequest;
import cn.boundivore.dl.base.response.impl.master.AbstractJobVo;
import cn.boundivore.dl.base.result.Result;
import cn.boundivore.dl.exception.BException;
import cn.boundivore.dl.orm.po.single.TDlService;
import cn.hutool.core.lang.Assert;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Description: 启动、重启、停止服务或组件
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2024/1/22
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
@Service
@RequiredArgsConstructor
public class MasterOperationService {

    private final MasterJobService masterJobService;

    private final MasterServiceService masterServiceService;

    /**
     * Description: 启动、重启、停止服务或组件
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2024/1/23
     * Modification description:
     * Modified by:
     * Modification time:
     *
     * @param request 主动将要操作的服务及其对应节点上的组件
     * @return Result<AbstractJobVo.JobIdVo> 集群 ID & JobID
     */
    public Result<AbstractJobVo.JobIdVo> operate(JobDetailRequest request) throws Exception {

        // 检查部署意图的合理性
        this.checkLegality(
                request.getClusterId(),
                request
        );

        Long jobId = masterJobService.initJob(request, true);

        return Result.success(
                new AbstractJobVo.JobIdVo(
                        request.getClusterId(),
                        jobId
                )
        );
    }

    /**
     * Description: 启动、重启、停止服务或组件
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2023/5/30
     * Modification description:
     * Modified by:
     * Modification time:
     *
     * @param request 主动将要操作的服务及其对应节点上的组件
     * @return Result<AbstractJobVo.JobIdVo> 集群 ID & JobID
     */
    public Result<AbstractJobVo.JobIdVo> operate(JobRequest request) throws Exception {

        // 检查部署意图的合理性
        this.checkLegality(
                request.getClusterId(),
                request
        );

        Long jobId = masterJobService.initJob(request, true);

        return Result.success(
                new AbstractJobVo.JobIdVo(
                        request.getClusterId(),
                        jobId
                )
        );
    }

    /**
     * Description: 检查操作的合理性
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2024/1/23
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @param clusterId 集群 ID
     * @param request   JobRequest or JobDetailRequest 请求体
     */
    private void checkLegality(Long clusterId,
                               IRequest request) {

        JobRequest jobRequest = null;
        JobDetailRequest jobDetailRequest = null;
        if (request instanceof JobRequest) {
            jobRequest = (JobRequest) request;
        } else {
            jobDetailRequest = (JobDetailRequest) request;
        }

        ActionTypeEnum actionTypeEnum = jobRequest != null
                ? jobRequest.getActionTypeEnum()
                : jobDetailRequest.getActionTypeEnum();

        List<String> serviceNameList = jobRequest != null
                ? jobRequest.getServiceNameList()
                : jobDetailRequest.getJobDetailServiceList()
                .stream()
                .map(JobDetailRequest.JobDetailServiceRequest::getServiceName)
                .collect(Collectors.toList());

        // 检查需要操作的符合是否合法
        final Map<String, TDlService> tDlServiceMap = this.masterServiceService
                .getTDlServiceList(clusterId)
                .stream()
                .filter(i -> i.getServiceState() != SCStateEnum.REMOVED
                        && i.getServiceState() != SCStateEnum.SELECTED
                        && i.getServiceState() != SCStateEnum.UNSELECTED)
                .collect(Collectors.toMap(TDlService::getServiceName, i -> i));

        serviceNameList.forEach(i ->
                Assert.notNull(
                        tDlServiceMap.get(i),
                        () -> new BException(
                                String.format(
                                        "部署操作必须选择不处于 %s、%s、%s状态的服务",
                                        SCStateEnum.REMOVED,
                                        SCStateEnum.SELECTED,
                                        SCStateEnum.UNSELECTED
                                )
                        )
                )
        );

        // TODO 检查操作的组件是否在对应节点存在


        switch (actionTypeEnum) {
            case START:
                break;
            case STOP:
                break;
            case RESTART:
                break;
            case DECOMMISSION:
                break;
            case DEPLOY:
                break;
            case REMOVE:
            default:
                throw new BException(
                        String.format(
                                "当前接口不支持的 ActionType: %s",
                                actionTypeEnum
                        )
                );
        }


    }
}
