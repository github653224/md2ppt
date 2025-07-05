# Markdown 幻灯片播放平台

## 项目简介
本项目是一个基于 Flask 的 Markdown 幻灯片播放平台，支持 Markdown 文件的展示、幻灯片导航、主题切换，同时支持 Mermaid 图表和 MathJax 数学公式渲染，还提供了文件上传接口。

## 技术栈
- **后端**：Flask
- **前端**：HTML、CSS、JavaScript
- **Markdown 解析**：marked.js
- **图表渲染**：Mermaid
- **数学公式渲染**：MathJax
- **代码高亮**：Prism.js

## 项目结构
```
slideshow-platform_dev/
├── app.py
├── favicon.ico
├── slides/
│   ├── go/
│   ├── java/
│   ├── python/
│   ├── list.json
│   └── ...
├── static/
│   ├── css/
│   │   ├── prism-tomorrow.min.css
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── main.js
│       └── ...
└── templates/
    ├── 404.html
    └── index.html
```

## 功能特性
1. **Markdown 幻灯片展示**：支持从 `slides` 目录下加载 Markdown 文件并渲染为幻灯片。
2. **主题切换**：在 logo 左侧有主题切换开关，可切换深色和浅色主题。
3. **幻灯片导航**：提供上一页、下一页按钮和幻灯片计数器。
4. **文件上传**：支持通过 `/upload/<path:keyword>` 接口上传 Markdown 文件。
5. **扩展功能**：支持 Mermaid 图表和 MathJax 数学公式渲染，代码高亮显示。

## 安装与运行
### 安装依赖
项目使用 Python 和 Flask，确保你已经安装 Python 3.x，然后运行以下命令安装依赖：
```bash
pip install flask
```
### 运行项目
在项目根目录下运行以下命令启动 Flask 应用：
```bash
python app.py
```
应用将在 `http://127.0.0.1:5001` 启动。

## 使用方法
### 浏览幻灯片
- 访问 `http://127.0.0.1:5001` 或 `http://127.0.0.1:5001/slides` 浏览默认幻灯片。
- 访问 `http://127.0.0.1:5001/slides/<目录名>` 浏览指定目录下的幻灯片。
- 使用页面底部的导航按钮切换幻灯片。
- 点击 logo 左侧的开关切换主题。

### 上传 Markdown 文件
使用 POST 请求访问 `/upload/<path:keyword>` 接口上传 Markdown 文件：
```bash
curl -X POST -F "file=@your_file.md" http://127.0.0.1:5001/upload/<keyword>
```
其中 `<keyword>` 对应 `slides` 目录下的子目录名。

## 注意事项
- 确保 `slides` 目录下的每个子目录都有 `list.json` 文件，用于记录该目录下的 Markdown 文件列表。
- 上传的文件必须是 `.md` 格式。