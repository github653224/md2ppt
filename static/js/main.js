// 幻灯片数据
const slides = [];
let currentSlide = 0;

// 定义 injectKey 变量，避免未定义错误
const injectKey = '';

// 初始化函数
async function init() {
    // 确保 marked 库已加载
    if (typeof marked === 'undefined') {
        console.error('marked 库未加载');
        return;
    }
    // 加载所有Markdown文件
    await loadSlides();

    // 显示第一张幻灯片
    if (slides.length > 0) {
        showSlide(currentSlide);
        updateSlideCounter();
    }
}

// 加载所有Markdown文件
async function loadSlides() {
    try {
        // 从URL路径获取目录路径
        const pathParts = window.location.pathname.split('/');
        const dirIndex = pathParts.indexOf('slides');
        const dirPath = dirIndex !== -1 ? pathParts.slice(dirIndex + 1).join('/') : '';
        // 确保路径不以 / 开头
        const normalizedDirPath = dirPath.startsWith('/') ? dirPath.slice(1) : dirPath;
        
        // 通过Flask API获取幻灯片数据，从元数据获取API基础URL
        const apiBaseUrl = document.querySelector('meta[name="api-base-url"]')?.getAttribute('content') || '';
        const response = await fetch(`${apiBaseUrl}/slides-data/${encodeURIComponent(normalizedDirPath)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.status === 'success') {
            // 清空现有幻灯片
            slides.length = 0;

            // 按 list.json 中的顺序添加幻灯片
            for (const filename of data.list.slides) {
                if (data.slides[filename]) {
                    slides.push(marked.parse(data.slides[filename]));
                }
            }
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('加载幻灯片时出错:', error);
        document.getElementById('slide-content').innerHTML = 
            '<h2>无法加载幻灯片内容</h2><p>请检查网络连接或确认幻灯片文件存在。</p>';
    }
}

// 显示指定的幻灯片
function showSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    const slideElement = document.getElementById('slide-content');
    
    // 添加过渡效果
    slideElement.classList.add('slide-exit');
    
    setTimeout(() => {
        // 更新幻灯片内容
        slideElement.innerHTML = slides[index];
        
        // 渲染Mermaid图表
        renderMermaidCharts();
        
        // 处理代码块，添加苹果风格
        processCodeBlocks();

        // 渲染 MathJax 数学公式
        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }

        // 强制重绘，确保滚动条正确显示
        void slideElement.offsetHeight;

        // 移除旧的过渡类并添加新的进入过渡
        slideElement.classList.remove('slide-exit');
        slideElement.classList.add('slide-enter');
        
        // 清除过渡类
        setTimeout(() => {
            slideElement.classList.remove('slide-enter');
        }, 500);
    }, 300);
    
    currentSlide = index;
    updateSlideCounter();
}

// 渲染Mermaid图表
function renderMermaidCharts() {
    // 查找所有mermaid代码块
    const mermaidBlocks = document.querySelectorAll('code.language-mermaid');
    
    // 如果有mermaid代码块，则渲染为图表
    mermaidBlocks.forEach((block) => {
        const code = block.textContent;
        
        // 创建一个容器元素
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.textContent = code;
        
        // 替换代码块为图表容器
        block.parentNode.replaceChild(container, block);
    });
    
    try {
        mermaid.init(undefined, '.mermaid-container');
    } catch (error) {
        console.error('渲染Mermaid图表时出错:', error);
        document.querySelectorAll('.mermaid-container').forEach(container => {
            const code = container.textContent;
            container.innerHTML = `<div class="mermaid-error">
                <h4>图表渲染失败:</h4>
                <pre>${code}</pre>
                <p>错误详情: ${error.message}</p>
            </div>`;
        });
    }
}

// 处理代码块，添加苹果风格
function processCodeBlocks() {
    console.log('Processing code blocks...');
    
    // 查找所有pre > code结构的代码块
    const codeBlocks = document.querySelectorAll('pre > code');
    console.log('Found code blocks:', codeBlocks.length);
    
    codeBlocks.forEach(function(codeBlock) {
        const pre = codeBlock.parentNode;
        
        // 获取语言类型
        const langClass = codeBlock.className;
        const langMatch = langClass.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : 'code';
        
        console.log('Processing code block with language:', lang);
        
        // 如果已经处理过，跳过
        if (pre.parentNode.classList.contains('apple-code-block')) {
            return;
        }
        
        // 创建苹果风格容器
        const appleContainer = document.createElement('div');
        appleContainer.className = 'apple-code-block';
        
        // 创建标题栏
        const titleBar = document.createElement('div');
        titleBar.className = 'apple-title-bar';
        
        // 创建按钮组
        const buttons = document.createElement('div');
        buttons.className = 'apple-buttons';
        
        // 添加三个按钮
        ['apple-red', 'apple-yellow', 'apple-green'].forEach(color => {
            const button = document.createElement('div');
            button.className = `apple-button ${color}`;
            buttons.appendChild(button);
        });
        
        // 添加语言标签
        const langLabel = document.createElement('div');
        langLabel.className = 'text-xs text-gray-600';
        langLabel.textContent = lang;
        
        // 组装标题栏
        titleBar.appendChild(buttons);
        titleBar.appendChild(langLabel);
        
        // 添加代码内容样式
        pre.className = 'apple-code-content m-0';
        
        // 插入到DOM中
        pre.parentNode.insertBefore(appleContainer, pre);
        appleContainer.appendChild(titleBar);
        appleContainer.appendChild(pre);
    });
    
    // 应用代码高亮
    Prism.highlightAll();
}

// 更新幻灯片计数器
function updateSlideCounter() {
    const counter = document.getElementById('slide-counter');
    counter.textContent = `${currentSlide + 1}/${slides.length}`;
}

// 上一页按钮点击事件
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    }
});

// 下一页按钮点击事件
document.getElementById('next-btn').addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        showSlide(currentSlide + 1);
    }
});

// 键盘导航
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && currentSlide > 0) {
        showSlide(currentSlide - 1);
    } else if (event.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        showSlide(currentSlide + 1);
    }
});

// 初始化应用
// 引入marked.js、mermaid.js和MathJax
(function () {
    // 引入marked.js用于解析Markdown
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = () => {
        // 引入mermaid.js用于解析Mermaid图表
        const mermaidScript = document.createElement('script');
        mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        mermaidScript.onload = () => {
            // 初始化mermaid配置
            mermaid.initialize({ 
                startOnLoad: false,
                theme: 'default',
                flowchart: {
                    useMaxWidth: false,
                    htmlLabels: true
                }
            });
            
            // 初始化应用
            init();
        };
        
        document.head.appendChild(mermaidScript);
    };
    
    document.head.appendChild(script);
})();