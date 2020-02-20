## 意图实体标注工具

### 改动

1. 简单支持了多文件异步编辑和保存。（之前一个服务仅支持一个文件编辑）目的是能够多人编辑，并解决在数据量很大的情况下读写时间过长的问题。

### 用法

```shell script
npm run build
node server.js -p 3000 -s data
```

- 访问浏览器 `http://localhost:3000/?xxx.json`, 其中`xxx.json`需要预先放在`data`目录下。

- 不同标注人员不要同时编辑一个文件。最好将文件上分工，每个文件都仅有一个人负责编辑。

- 仅是简单做了修改，所有内容还是会在启动时预先加载到内存中。故不要一次搞太多数据。


### 架构方面

1. nodejs + express 后端 （单文件对应 ./server.js）
2. vue.js 前端 (src 文件夹下)


### 原始Readme


This is a tool to edit your training examples for [rasa NLU](https://github.com/rasahq/rasa_nlu)
Use the [online version](https://rasahq.github.io/rasa-nlu-trainer/) or [install with npm](#installation)

## installation

`$ npm i -g rasa-nlu-trainer` (you'll need [nodejs and npm](https://nodejs.org/) for this)

## launch
`$ rasa-nlu-trainer` in your working directory

this will open the editor in your browser

#### options
- `--source -s` path to the training file (by default it will be searched recursively in the current directory)
- `--port -p` the web app will run here (randomly selected by default)

## development

- git clone this repo
- `$ npm install`
- `$ npm start`

#### using the development build locally

- `$ npm run build`
- `$ npm link`

from here, the `$ rasa-nlu-trainer` command will start the development version

run `$ npm run build` again to update the build

run `$ npm unlink && npm i -g rasa-nlu-trainer` to use the npm version again


This project was bootstrapped with [Create React App](./CRA_README.md).
