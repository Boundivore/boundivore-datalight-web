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
package cn.boundivore.dl.orm.po.custom;

import cn.boundivore.dl.base.enumeration.impl.NodeStateEnum;
import cn.boundivore.dl.orm.po.TBasePo;
import com.baomidou.mybatisplus.annotation.TableField;
import io.swagger.annotations.ApiModelProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * Description: 配置文件与节点的 join 详情
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2023/6/9
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
@Getter
@Setter
@Accessors(chain = true)
public class ConfigNodeDto extends TBasePo<ConfigNodeDto> {
    private static final long serialVersionUID = 1L;

    @Schema(name = "集群 ID")
    @TableField("cluster_id")
    private Long clusterId;

    @Schema(name = "配置文件 ID")
    @TableField("config_id")
    private Long configId;

    @Schema(name = "主机名")
    @TableField("hostname")
    private String hostname;

    @Schema(name = "IPV4 地址")
    @TableField("ipv4")
    private String ipv4;

    @Schema(name = "IPV6 地址")
    @TableField("ipv6")
    private String ipv6;

    @Schema(name = "SSH 端口 默认为 22 端口，可自定义修改")
    @TableField("ssh_port")
    private Long sshPort;

    @Schema(name = "CPU 架构")
    @TableField("cpu_arch")
    private String cpuArch;

    @Schema(name = "CPU 核心数 单位：个")
    @TableField("cpu_cores")
    private Long cpuCores;

    @Schema(name = "内存总大小 单位：Kbytes")
    @TableField("ram")
    private Long ram;

    @Schema(name = "磁盘总容量 单位：Kbytes")
    @TableField("disk")
    private Long disk;

    @Schema(name = "状态枚举，见代码")
    @TableField("node_state")
    private NodeStateEnum nodeState;

    @Schema(name = "系统版本")
    @TableField("os_version")
    private String osVersion;

    @Schema(name = "节点 ID")
    @TableField("node_id")
    private Long nodeId;

    @Schema(name = "服务名称")
    @TableField("service_name")
    private String serviceName;

    @Schema(name = "配置文件名称")
    @TableField("filename")
    private String filename;

    @Schema(name = "配置文件内容 配置文件内容的 Base64")
    @TableField("config_data")
    private String configData;

    @Schema(name = "文件内容摘要 256 位摘要算法，极低碰撞概率，用于比较文件内容是否相同")
    @TableField("sha256")
    private String sha256;

    @Schema(name = "配置文件路径")
    @TableField("config_path")
    private String configPath;

    @Schema(name = "当前版本号")
    @TableField("config_version")
    private Long configVersion;

}
