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
package cn.boundivore.dl.service.master.manage.node.bean;

import cn.boundivore.dl.base.enumeration.impl.ExecStateEnum;
import cn.boundivore.dl.base.enumeration.impl.NodeStepTypeEnum;
import cn.boundivore.dl.ssh.bean.TransferProgress;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.Accessors;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Description: NodeStepMeta
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2023/6/8
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
@ToString(
        exclude = {
                "nodeTaskMeta"
        }
)
public class NodeStepMeta extends NodeTimeMeta {
    private static final long serialVersionUID = -8476057122131325007L;

    private transient NodeTaskMeta nodeTaskMeta;

    private Long id;

    private NodeStepTypeEnum type;

    private String name;

    private String shell;

    private List<String> args;

    private List<String> interactions;

    private Integer exits;

    private Long timeout;

    private Long sleep;

    private ExecStateEnum execStateEnum;

    private NodeStepResult nodeStepResult;

    //程序包推送进度
    private TransferProgress transferProgress;

    /**
     * Description: 异步 NodeStep 执行结果信息
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2023/6/8
     * Modification description:
     * Modified by:
     * Modification time:
     * Version: V1.0
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public final static class NodeStepResult {
        private boolean isSuccess;
    }

    /**
     * Description: 获取字符串形式的参数列表，以英文逗号分割
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2024/2/27
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @param list 参数列表
     * @return 字符串形式的参数列表，以英文逗号分割
     */
    public static String list2Str(List<String> list) {
        if (list == null) {
            return null;
        }
        return String.join(",", list);
    }

    /**
     * Description: 获取参数列表的字符串形式
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2024/2/27
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @param str 参数列表的字符串形式，以英文逗号分割存储于数据库中
     * @return List 列表
     */
    public static List<String> str2List(String str) {
        if (str == null || str.isEmpty()) {
            return null;
        }
        return Arrays.stream(str.split(","))
                .collect(Collectors.toList());
    }
}
