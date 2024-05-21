#  boundivore-datalight-web

### 一、简介
DataLight 前端项目

基于 React18、React-Router v6、Zustand、TypeScript、Vite4、Ant-Design、Tailwind、Husky、Commitlint 开源的管理系统。


### 二、安装使用步骤

- **Clone：**

```text
# Gitee
git clone git@gitee.com:boundivore/boundivore-datalight-web.git
```

- **Install：**

```text
npm install
cnpm install

# npm install 安装失败，请升级 nodejs 到 16 以上，或尝试使用以下命令：
npm install --registry=https://registry.npm.taobao.org
```
- **Run：**

```text
npm run dev
```

- **Build：**

```text
npm run build
```
- **Lint：**

```text
# eslint 检测代码
npm run lint
```
- **Commit：**

```text
# Commitlint 提交规范
git commit -m type(scope?): subject //注意冒号后面有空格
- type：提交的改动类型（如新增、修改、更新等）
- scope：标识此次提交主要涉及到代码中哪个模块，非必填
- subject：描述此次提交的主要内容

```
```text
# 示例
git commit -m 'feat(blog): 增加 xxx 功能'
git commit -m 'bug: 修复 xxx 功能'
```

常用type
- feat：添加新功能（比如新增一个按钮操作）。
- fix：修复 bug。
- docs：文档修改（添加或者更新文档）。
- style：不影响代码功能的变动，不包括样式修改（比如去掉空格、改变缩进、增删分号等）。
- refactor：代码重构（即不是新增功能，也不是修改 bug 的代码变动，比如变量重命名）。
- perf：代码优化（比如提升性能、体验）
- test：添加或者更新测试。
- build：影响构建打包，或外部依赖的修改，比如发布版本，对项目依赖的改动等
- ci：脚本变更（对 CI 配置文件或者脚本的修改）
- chore：其他不会修改 src 或者 test 的修改
- revert：恢复到上一个版本。


### 三、架构
架构说明
```
boundivore-datalight-web
├─ .commitlintrc.cjs
├─ .eslintrc.cjs
├─ .gitignore
├─ .husky
├─ .prettierrc.cjs
├─ LICENSE
├─ README.en.md
├─ README.md
├─ index.html
├─ node.cjs
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
├─ src
│  ├─ App.tsx
│  ├─ api            //与服务端交互相关
│  ├─ assets
│  ├─ components     //自定义组件
│  │  ├─ alert
│  │  ├─ charts
│  │  ├─ permission
│  │  ├─ steps
│  ├─ hooks         //自定义hooks
│  ├─ i18n
│  ├─ layouts
│  ├─ main.tsx       //项目入口文件
│  ├─ pages          //项目页面
│  │  ├─ auth        //登录等用户认证相关
│  │  ├─ cluster     //集群管理
│  │  ├─ home.tsx    //首页
│  │  ├─ log         //日志管理
│  │  ├─ monitorAlert  //监控告警
│  │  │  ├─ alert
│  │  │  └─ monitor
│  │  ├─ node        //节点管理
│  │  ├─ permission  //用户 & 权限
│  │  └─ service     //服务管理
│  ├─ store          //Zustand状态管理
│  │  └─ store.ts
│  ├─ styles
│  │  ├─ ThemeProvider.tsx    //自定义主题
│  ├─ utils
│  └─ vite-env.d.ts
├─ tailwind.config.js
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```

### 四、浏览器支持
推荐使用 Chrome 最新版浏览器
### 五、开源协议
本项目采用 Apache 2.0 开源协议。有关详细内容，请查看 Apache 2.0 LICENSE。

### 六、鸣谢

#### 用户

感谢所有贡献者和提交者

#### 贡献者（Contributors）

特别感谢以下人员对本项目的贡献：

- [@boundivore](https://gitee.com/boundivore)
- [@Tracy-88](https://gitee.com/Tracy-88)

#### 提交者（Committers）

特别感谢以下人员为本项目提交代码：

- [@boundivore](https://gitee.com/boundivore)
- [@Tracy-88](https://gitee.com/Tracy-88)

我们非常感谢他们的支持和贡献！

#### 项目

在此特别感谢所有在本项目研发过程中使用到的开源项目或代码库。

没有这些项目的支持，本项目无法顺利进行。

其中特别鸣谢以下开源项目： 
- **[React](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Zustand](https://zustand-demo.pmnd.rs/)**
- **[Echarts](https://echarts.apache.org/)**
