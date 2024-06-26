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
package cn.boundivore.dl.base.utils;

/**
 * Description: 组件工具类
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2023/8/29
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
public class ComponentUtil {


    /**
     * Description: 修剪去除组件名称末尾的数字
     * Created by: Boundivore
     * E-mail: boundivore@foxmail.com
     * Creation time: 2023/8/29
     * Modification description:
     * Modified by:
     * Modification time:
     * Throws:
     *
     * @param componentName 可能带有数字结尾的组件名，如：NameNode1 NameNode2，
     *                      但是 HiveServer2、HThriftServer2 等这种组件名称末尾的数字不可去除，
     *                      该数字并不表示同类型组件的逻辑区分，而是名字本身。
     * @return 返回修剪后的组件名：如：NameNode
     */
    public static String clipComponentName(String componentName) {
        if (componentName == null || componentName.trim().isEmpty()) {
            throw new IllegalArgumentException("组件名称不能为空");
        }

        switch (componentName) {
            case "HiveServer2":
            case "HThriftServer2":
            case "SparkThriftServer2":
                return componentName;
            default:
                return componentName.replaceAll("\\d+$", "");
        }

    }
}
