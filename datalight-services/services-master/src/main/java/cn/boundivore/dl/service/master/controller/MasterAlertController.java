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

import cn.boundivore.dl.api.master.define.IMasterAlertAPI;
import cn.boundivore.dl.base.request.impl.common.AlertWebhookPayloadRequest;
import cn.boundivore.dl.base.request.impl.master.AbstractAlertRequest;
import cn.boundivore.dl.base.response.impl.master.AbstractAlertVo;
import cn.boundivore.dl.base.result.Result;
import cn.boundivore.dl.service.master.service.MasterAlertService;
import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

/**
 * Description: MasterAlertController
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
public class MasterAlertController implements IMasterAlertAPI {

    private final MasterAlertService masterAlertService;

    @SaIgnore
    @Override
    public Result<String> alertHook(AlertWebhookPayloadRequest request) throws Exception {
        return this.masterAlertService.alertHook(request);
    }

    @Override
    public Result<AbstractAlertVo.AlertRuleVo> newAlertRule(AbstractAlertRequest.NewAlertRuleRequest request) throws Exception {
        return this.masterAlertService.newAlertRule(request);
    }

    @Override
    public Result<String> removeAlertRule(AbstractAlertRequest.AlertIdListRequest request) throws Exception {
        return this.masterAlertService.removeAlertRule(request);
    }

    @Override
    public Result<AbstractAlertVo.AlertSimpleListVo> getAlertSimpleList(Long clusterId) throws Exception {
        return this.masterAlertService.getAlertSimpleList(clusterId);
    }

    @Override
    public Result<AbstractAlertVo.AlertRuleVo> getAlertDetailById(Long alertId) throws Exception {
        return this.masterAlertService.getAlertDetailById(alertId);
    }

    @Override
    public Result<String> switchAlertEnabled(AbstractAlertRequest.AlertSwitchEnabledListRequest request) throws Exception {
        return this.masterAlertService.switchAlertEnabled(request);
    }

    @Override
    public Result<AbstractAlertVo.AlertRuleVo> updateAlertRule(AbstractAlertRequest.UpdateAlertRuleRequest request) throws Exception {
        return this.masterAlertService.updateAlertRule(request);
    }
}
