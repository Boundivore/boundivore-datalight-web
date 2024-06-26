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
package cn.boundivore.dl.api.master.define;

import cn.boundivore.dl.base.request.impl.master.AbstractNodeInitRequest;
import cn.boundivore.dl.base.request.impl.master.NodeJobRequest;
import cn.boundivore.dl.base.request.impl.master.ParseHostnameRequest;
import cn.boundivore.dl.base.response.impl.master.AbstractNodeInitVo;
import cn.boundivore.dl.base.response.impl.master.AbstractNodeJobVo;
import cn.boundivore.dl.base.response.impl.master.ParseHostnameVo;
import cn.boundivore.dl.base.result.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import javax.validation.Valid;

import static cn.boundivore.dl.base.constants.IUrlPrefixConstants.MASTER_URL_PREFIX;


/**
 * Description: 节点管理的相关接口定义
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2023/5/13
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
@Api(value = "IMasterNodeInitAPI", tags = {"Master 接口：节点初始化相关"})
@FeignClient(
        name = "IMasterNodeInitAPI",
        contextId = "IMasterNodeInitAPI",
        path = MASTER_URL_PREFIX
)
public interface IMasterNodeInitAPI {

    @PostMapping(value = "/node/init/hostname/parse")
    @ApiOperation(notes = "Parse 解析节点主机名", value = "Parse 解析节点主机名")
    Result<ParseHostnameVo> parseHostname(
            @RequestBody
            @Valid
            ParseHostnameRequest request
    ) throws Exception;

    @PostMapping(value = "/node/init/detect")
    @ApiOperation(notes = "Detect 节点异步探测连通性", value = "Detect 节点异步探测连通性")
    Result<AbstractNodeJobVo.NodeJobIdVo> detectNode(
            @RequestBody
            @Valid
            NodeJobRequest request
    ) throws Exception;

    @PostMapping(value = "/node/init/check")
    @ApiOperation(notes = "Check 节点初始化检查", value = "Check 节点初始化检查")
    Result<AbstractNodeJobVo.NodeJobIdVo> checkNode(
            @RequestBody
            @Valid
            NodeJobRequest request
    ) throws Exception;

    @PostMapping(value = "/node/init/dispatch")
    @ApiOperation(notes = "Dispatch 分发节点安装包", value = "Dispatch 分发节点安装包")
    Result<AbstractNodeJobVo.NodeJobIdVo> dispatchNode(
            @RequestBody
            @Valid
            NodeJobRequest request
    ) throws Exception;

    @PostMapping(value = "/node/init/startWorker")
    @ApiOperation(notes = "StartWorker 启动节点 Worker 进程", value = "StartWorker 启动节点 Worker 进程")
    Result<AbstractNodeJobVo.NodeJobIdVo> startNodeWorker(
            @RequestBody
            @Valid
            NodeJobRequest request
    ) throws Exception;

    @GetMapping(value = "/node/init/parse/list")
    @ApiOperation(notes = "Parse 获取节点初始化列表", value = "Parse 获取节点初始化列表")
    Result<AbstractNodeInitVo.NodeInitVo> initParseList(
            @ApiParam(name = "ClusterId", value = "ClusterId")
            @RequestParam(value = "ClusterId", required = true)
            Long clusterId
    ) throws Exception;

    @PostMapping(value = "/node/init/detect/list")
    @ApiOperation(notes = "Detect 获取节点初始化列表", value = "Detect 获取节点初始化列表")
    Result<AbstractNodeInitVo.NodeInitVo> initDetectList(
            @RequestBody
            @Valid
            AbstractNodeInitRequest.NodeInitInfoListRequest request
    ) throws Exception;



    @PostMapping(value = "/node/init/check/list")
    @ApiOperation(notes = "Check 获取节点初始化列表", value = "Check 获取节点初始化列表")
    Result<AbstractNodeInitVo.NodeInitVo> initCheckList(
            @RequestBody
            @Valid
            AbstractNodeInitRequest.NodeInitInfoListRequest request
    ) throws Exception;

    @PostMapping(value = "/node/init/dispatch/list")
    @ApiOperation(notes = "Dispatch 获取节点初始化列表", value = "Dispatch 获取节点初始化列表")
    Result<AbstractNodeInitVo.NodeInitVo> initDispatchList(
            @RequestBody
            @Valid
            AbstractNodeInitRequest.NodeInitInfoListRequest request
    ) throws Exception;

    @PostMapping(value = "/node/init/startWorker/list")
    @ApiOperation(notes = "StartWorker 获取节点初始化列表", value = "StartWorker 获取节点初始化列表")
    Result<AbstractNodeInitVo.NodeInitVo> initStartWorkerList(
            @RequestBody
            @Valid
            AbstractNodeInitRequest.NodeInitInfoListRequest request
    ) throws Exception;

    @PostMapping(value = "/node/init/add")
    @ApiOperation(notes = "Add 服役节点到指定集群", value = "Add 服役节点到指定集群")
    Result<String> addNode(
            @RequestBody
            @Valid
            AbstractNodeInitRequest.NodeInitInfoListRequest request
    ) throws Exception;

}
