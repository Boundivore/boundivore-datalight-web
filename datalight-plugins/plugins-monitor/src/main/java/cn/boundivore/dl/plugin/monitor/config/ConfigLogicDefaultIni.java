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
package cn.boundivore.dl.plugin.monitor.config;

import cn.boundivore.dl.plugin.base.bean.PluginConfig;
import cn.boundivore.dl.plugin.base.config.AbstractConfigLogic;
import cn.hutool.core.lang.Assert;

import java.io.File;
import java.util.stream.Collectors;

/**
 * Description: 配置 defaults.ini 文件
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2023/6/14
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
public class ConfigLogicDefaultIni extends AbstractConfigLogic {


    public ConfigLogicDefaultIni(PluginConfig pluginConfig) {
        super(pluginConfig);
    }

    @Override
    public String config(File file, String replacedTemplated) {
        super.printFilename(
                pluginConfig.getCurrentMetaComponent().getHostname(),
                file
        );

        // 获取 Grafana Home dashboard 路径
        String grafanaHomeDashboardFilePath = this.grafanaHomeDashboardFilePath();

        // 获取 Grafana 所在节点主机名
        String grafanaHostname = this.grafanaHostname();

        // 获取 {{DATA_DIR}}
        String dataDir = super.dataDir();

        // 获取 {{LOG_DIR}}
        String logDir = super.logDir();

        return replacedTemplated
                .replace(
                        "{{default_home_dashboard_path}}",
                        grafanaHomeDashboardFilePath
                )
                .replace(
                        "{{server.domain}}",
                        grafanaHostname
                )
                .replace(
                        "{{DATA_DIR}}",
                        dataDir
                )
                .replace(
                        "{{LOG_DIR}}",
                        logDir
                )
                ;
    }

    /**
     * Description: 获取 Grafana 默认家页面的配置文件路径
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2023/7/28
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @return Grafana 默认家页面的配置文件路径
     */
    private String grafanaHomeDashboardFilePath() {
        String serviceDir = super.pluginConfig.getUnixEnv().getSERVICE_DIR();
        Assert.notNull(
                serviceDir,
                () -> new RuntimeException("无法读取环境变量 SERVICE_DIR")
        );

        return String.format(
                "%s/MONITOR/grafana/conf/GrafanaDefaultHome.json",
                serviceDir
        );
    }

    /**
     * Description: 获取 Grafana 所在节点主机名
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2023/7/28
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @return Grafana 所在节点主机名
     */
    private String grafanaHostname() {
        PluginConfig.MetaComponent grafanaMetaComponent = super.pluginConfig.getCurrentMetaService()
                .getMetaComponentMap()
                .values()
                .stream()
                .filter(i -> i.getComponentName().equals("Grafana"))
                .collect(Collectors.toList())
                .get(0);

        if (grafanaMetaComponent != null) {
            return grafanaMetaComponent.getHostname();
        }

        return "localhost";
    }


}
