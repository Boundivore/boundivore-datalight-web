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
package cn.boundivore.dl.boot.logs;

import cn.boundivore.dl.base.result.ErrorMessage;
import cn.boundivore.dl.base.result.Result;
import cn.boundivore.dl.base.result.ResultEnum;
import cn.boundivore.dl.boot.utils.ReactiveAddressUtil;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.exceptions.ExceptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Description: AOP 拦截 @Logs 注解
 * Created by: Boundivore
 * E-mail: boundivore@foxmail.com
 * Creation time: 2024/6/11
 * Modification description:
 * Modified by:
 * Modification time:
 * Version: V1.0
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LogAspect {

    private final ThreadPoolTaskExecutor commonExecutor;

    @Pointcut("@annotation(cn.boundivore.dl.boot.logs.Logs) || @within(cn.boundivore.dl.boot.logs.Logs)")
    public void logPointCut() {
    }

    @Around("logPointCut()")
    public Object logs(ProceedingJoinPoint joinPoint) {
        try {
            LogTrace logTrace = new LogTrace();
            MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
            Method method = methodSignature.getMethod();

            // 检查方法上是否有 @LogsIgnore 注解，如有，则忽略，并放行
            if (method.isAnnotationPresent(LogsIgnore.class)) {
                return joinPoint.proceed();
            }

            // 获取方法上的注解
            Logs methodAnnotation = method.getAnnotation(Logs.class);

            // 获取类上的注解
            Class<?> targetClass = joinPoint.getTarget().getClass();
            Logs classAnnotation = targetClass.getAnnotation(Logs.class);

            // 如果方法上和类上都有注解，优先使用方法上的注解
            Logs logsAnnotation = methodAnnotation != null ? methodAnnotation : classAnnotation;
            assert logsAnnotation != null;

            //Name & Type
            logTrace.setLogName(logsAnnotation.name());
            logTrace.setLogType(logsAnnotation.logType());

            //Class.Method
            String className = joinPoint.getTarget().getClass().getName();
            String methodName = method.getName();
            String classMethodName = String.format("%s#%s()", className, methodName);
            logTrace.setClassMethod(classMethodName);

            //Time & Date
            LocalDateTime now = LocalDateTime.now();
            ZoneId zoneId = ZoneId.of("GMT+8");
            ZonedDateTime zonedDateTime = now.atZone(zoneId);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String dateFormat = zonedDateTime.format(formatter);
            long timestamp = zonedDateTime.toInstant().toEpochMilli();

            logTrace.setTimeStamp(timestamp);
            logTrace.setDateFormat(dateFormat);

            //Params
            Object[] params = joinPoint.getArgs();
            logTrace.setParams(params);

            //Uri
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            assert attributes != null;
            HttpServletRequest request = attributes.getRequest();

            String uri = request.getRequestURI();
            logTrace.setUri(uri);

            //Ip
            logTrace.setIp(ReactiveAddressUtil.getRemoteIp(request));

            //User
            if (StpUtil.isLogin()) {
                Long userId = Long.parseLong(StpUtil.getSession().get("userId").toString());
                logTrace.setUserId(userId);
            }

            Object result = joinPoint.proceed();
            if (result instanceof Result) {
                Result<?> r = (Result<?>) result;
                logTrace.setResultCode(r.getCode());
                logTrace.setResultEnum(ResultEnum.getByCode(r.getCode()));
                logTrace.setResult(r);

                if (logsAnnotation.isPrintResult()) {
                    logTrace.setResult(r);
                }
            }

            //TODO Export log to ElasticSearch or HBase or Kafka asynchronously.
            //TODO Temporarily store in a local file.
            this.commonExecutor.submit(new LogExporterTask(
                            logTrace.getLogName(),
                            logTrace
                    )
            );

            return result;
        } catch (Throwable e) {
            val error = ExceptionUtil.stacktraceToString(e);
            log.error(error);
            return Result.fail(
                    ResultEnum.FAIL_UNKNOWN,
                    new ErrorMessage(ExceptionUtil.getSimpleMessage(e))
            );
        }
    }
}