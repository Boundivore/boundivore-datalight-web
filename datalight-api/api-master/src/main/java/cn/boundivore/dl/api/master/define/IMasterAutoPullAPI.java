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

import cn.boundivore.dl.base.request.impl.common.AbstractAutoPullRequest;
import cn.boundivore.dl.base.response.impl.master.AutoPullProcessVo;
import cn.boundivore.dl.base.result.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import javax.validation.Valid;

import static cn.boundivore.dl.base.constants.IUrlPrefixConstants.MASTER_URL_PREFIX;


/**
 * Description: 切换自动拉起进程开关状态(包含 Worker 与 Component)
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2024/3/21
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
@Api(value = "IMasterAutoPullAPI", tags = {"Master 接口：自动拉起开关相关"})
@FeignClient(
        name = "IMasterAutoPullAPI",
        contextId = "IMasterAutoPullAPI",
        path = MASTER_URL_PREFIX
)
public interface IMasterAutoPullAPI {

    @PostMapping(value = "/auto/pull/switch/worker")
    @ApiOperation(notes = "切换自动拉起 Worker 开关状态", value = "切换自动拉起 Worker 开关状态")
    Result<String> switchAutoPullWorker(
            @RequestBody
            @Valid
            AbstractAutoPullRequest.AutoPullWorkerRequest request
    ) throws Exception;

    @PostMapping(value = "/auto/pull/switch/component")
    @ApiOperation(notes = "切换自动拉起 Component 开关状态", value = "切换自动拉起 Component 开关状态")
    Result<String> switchAutoPullComponent(
            @RequestBody
            @Valid
            AbstractAutoPullRequest.AutoPullComponentRequest request
    ) throws Exception;

    @GetMapping(value = "/auto/pull/get")
    @ApiOperation(notes = "获取进程拉起开关状态", value = "获取进程拉起开关状态")
    Result<AutoPullProcessVo> getAutoPullState() throws Exception;
}
