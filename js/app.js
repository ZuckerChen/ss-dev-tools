/**
 * 主应用控制器 - 管理所有工具模块
 */
class SSDevToolsApp {
    constructor() {
        this.tools = new Map();
        this.currentTool = null;
    }

    // 初始化应用
    init() {
        this.initTheme();
        this.initSidebar();
        this.initNavigation();
        this.initTabs();
        this.initTools();
        this.initDevSites();
        this.addAnimationStyles();
        
        this.initQrcodeTool();
        this.initQrcodeDecodeTool(); // 新增：初始化二维码解析工具
        
        // 新增：初始化时间戳工具
        this.initTimestampTool();
        this.updateCurrentTime();
        
        console.log('📦 SS开发工具包启动成功！');
        console.log('🔧 已加载工具模块:', Array.from(this.tools.keys()));
    }

    // 初始化主题
    initTheme() {
        const themeBtn = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        themeBtn?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // 初始化侧边栏
    initSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        // 恢复侧边栏状态
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
        
        // 侧边栏折叠切换
        sidebarToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // 分类折叠功能
        document.querySelectorAll('.nav-category-title').forEach(title => {
            title.addEventListener('click', () => {
                const category = title.parentElement;
                const categoryId = category.dataset.category;
                
                category.classList.toggle('collapsed');
                
                // 保存分类折叠状态
                const collapsed = category.classList.contains('collapsed');
                localStorage.setItem(`category-${categoryId}-collapsed`, collapsed);
            });
        });
        
        // 恢复分类折叠状态
        document.querySelectorAll('.nav-category').forEach(category => {
            const categoryId = category.dataset.category;
            const isCollapsed = localStorage.getItem(`category-${categoryId}-collapsed`) === 'true';
            if (isCollapsed) {
                category.classList.add('collapsed');
            }
        });
        
        // 移动端处理
        this.handleMobileNavigation(sidebar, mainContent);
    }

    // 移动端导航处理
    handleMobileNavigation(sidebar, mainContent) {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMobile = (e) => {
            if (e.matches) {
                // 移动端：点击内容区域关闭侧边栏
                mainContent.addEventListener('click', this.closeMobileSidebar);
            } else {
                // 桌面端：移除移动端事件监听
                mainContent.removeEventListener('click', this.closeMobileSidebar);
            }
        };
        
        this.closeMobileSidebar = () => {
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        };
        
        mediaQuery.addListener(handleMobile);
        handleMobile(mediaQuery);
    }

    // 初始化导航
    initNavigation() {
        document.querySelectorAll('.nav-category-items a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolId = link.getAttribute('href').substring(1);
                this.showTool(toolId);
                
                // 更新活动状态
                document.querySelectorAll('.nav-category-items a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // 顶层直达：开发站点大全
        document.querySelectorAll('.nav-category-title.top-link').forEach(title => {
            title.addEventListener('click', () => {
                const target = title.getAttribute('data-tool-target');
                if (target) {
                    this.showTool(target);
                    // 高亮清理
                    document.querySelectorAll('.nav-category-items a').forEach(l => l.classList.remove('active'));
                }
            });
        });
    }

    // 显示工具
    showTool(toolId) {
        // 隐藏所有工具面板
        document.querySelectorAll('.tool-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // 显示指定工具面板
        const targetPanel = document.getElementById(toolId);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.currentTool = toolId;
        }
    }

    // 初始化标签页
    initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabGroup = btn.parentElement;
                const targetTab = btn.dataset.tab;
                
                // 切换按钮状态
                tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 切换内容状态
                const tabContainer = tabGroup.parentElement;
                tabContainer.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // 初始化工具模块
    initTools() {
        try {
            // 注册工具模块
            this.registerTool('json', new JSONTool());
            this.registerTool('xml', new XMLTool());
            this.registerTool('encoding', new EncodingTool());
            this.registerTool('cron', new CronTool());
            
            // 初始化所有工具
            this.tools.forEach((tool, name) => {
                try {
                    tool.init();
                    console.log(`✅ ${tool.name} 初始化成功`);
                } catch (error) {
                    console.error(`❌ ${tool.name} 初始化失败:`, error);
                }
            });
            
            // 显示默认工具
            // 默认定位到 JSON解析
            this.showTool('json-parser');
            
        } catch (error) {
            console.error('工具初始化失败:', error);
        }
    }

    // 初始化开发站点大全
    initDevSites() {
        if (!window.DevSitesConfig) {
            console.warn('开发站点配置未加载');
            return;
        }

        this.currentCategory = 'all';
        this.searchTerm = '';
        
        // 渲染所有站点
        this.renderDevSites();
        
        // 绑定搜索功能
        const searchInput = document.getElementById('siteSearch');
        const clearSearch = document.getElementById('clearSearch');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderDevSites();
            });
        }
        
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                this.searchTerm = '';
                this.renderDevSites();
            });
        }
        
        // 绑定分类过滤
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // 更新按钮状态
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 更新当前分类
                this.currentCategory = btn.dataset.category;
                this.renderDevSites();
            });
        });
    }

    // 渲染开发站点
    renderDevSites() {
        const container = document.getElementById('devSitesContainer');
        const totalSitesEl = document.getElementById('totalSites');
        const visibleSitesEl = document.getElementById('visibleSites');
        
        if (!container || !window.DevSitesConfig) return;
        
        // 获取所有站点
        let allSites = [];
        let totalCount = 0;
        
        Object.entries(window.DevSitesConfig).forEach(([category, sites]) => {
            totalCount += sites.length;
            sites.forEach(site => {
                allSites.push({
                    ...site,
                    category: category,
                    categoryName: this.getCategoryName(category)
                });
            });
        });
        
        // 过滤站点
        let filteredSites = allSites;
        
        // 分类过滤
        if (this.currentCategory !== 'all') {
            filteredSites = filteredSites.filter(site => site.category === this.currentCategory);
        }
        
        // 搜索过滤
        if (this.searchTerm) {
            filteredSites = filteredSites.filter(site => {
                const searchText = `${site.name} ${site.desc} ${site.tags.join(' ')}`.toLowerCase();
                return searchText.includes(this.searchTerm);
            });
        }
        
        // 按分类分组
        const groupedSites = {};
        filteredSites.forEach(site => {
            if (!groupedSites[site.category]) {
                groupedSites[site.category] = [];
            }
            groupedSites[site.category].push(site);
        });
        
        // 渲染HTML
        let html = '';
        Object.entries(groupedSites).forEach(([category, sites]) => {
            const categoryName = this.getCategoryName(category);
            html += `
                <div class="site-category">
                    <h3 class="category-title">${categoryName}</h3>
                    <div class="site-grid">
                        ${sites.map(site => this.renderSiteCard(site)).join('')}
                    </div>
                </div>
            `;
        });
        
        if (html === '') {
            html = '<div class="no-results">没有找到匹配的站点</div>';
        }
        
        container.innerHTML = html;
        
        // 更新统计
        if (totalSitesEl) totalSitesEl.textContent = totalCount;
        if (visibleSitesEl) visibleSitesEl.textContent = filteredSites.length;
    }

    // 渲染站点卡片
    renderSiteCard(site) {
        const iconUrl = this.getSiteIcon(site.url);
        return `
            <a href="${site.url}" target="_blank" rel="noopener noreferrer" class="site-card">
                <div class="site-header">
                    <img src="${iconUrl}" alt="${site.name}" class="site-icon" onerror="this.style.display='none'">
                    <h4 class="site-name">${site.name}</h4>
                </div>
                <p class="site-desc">${site.desc}</p>
                <div class="site-tags">
                    ${site.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </a>
        `;
    }

    // 获取站点图标
    getSiteIcon(url) {
        try {
            const domain = new URL(url).origin;
            return `${domain}/favicon.ico`;
        } catch {
            return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd"/></svg>';
        }
    }

    // 获取分类中文名
    getCategoryName(category) {
        const categoryNames = {
            frontend: '前端开发',
            backend: '后端开发',
            database: '数据库',
            cloud: '云服务',
            tools: '开发工具',
            vcs: '版本控制',
            learning: '学习资源',
            design: '设计资源',
            devops: '监控运维',
            ai: 'AI工具与服务'
        };
        return categoryNames[category] || category;
    }

    // 注册工具
    registerTool(name, toolInstance) {
        if (!(toolInstance instanceof BaseTool)) {
            throw new Error(`工具 ${name} 必须继承自 BaseTool`);
        }
        
        this.tools.set(name, toolInstance);
        console.log(`🔧 工具 ${toolInstance.name} 注册成功`);
    }

    // 获取工具实例
    getTool(name) {
        return this.tools.get(name);
    }

    // 添加动画样式
    addAnimationStyles() {
        if (document.getElementById('app-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'app-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .tool-panel.active {
                animation: fadeIn 0.3s ease;
            }
            
            .stats-container {
                margin-top: 12px;
                padding: 12px 16px;
                background: linear-gradient(135deg, var(--primary-color), #6366f1);
                border-radius: var(--border-radius);
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
                animation: fadeIn 0.3s ease;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                color: white;
                min-width: 80px;
            }
            
            .stat-label {
                font-size: 0.8rem;
                opacity: 0.9;
                margin-bottom: 4px;
            }
            
            .stat-value {
                font-weight: 600;
                font-size: 1rem;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            }
            
            .diff-item {
                padding: 8px 12px;
                margin: 4px 0;
                border-radius: 4px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.9rem;
            }
            
            .diff-item.added {
                background-color: #dcfce7;
                border-left: 4px solid #16a34a;
                color: #166534;
            }
            
            .diff-item.deleted {
                background-color: #fef2f2;
                border-left: 4px solid #dc2626;
                color: #991b1b;
            }
            
            .diff-item.changed {
                background-color: #fef3c7;
                border-left: 4px solid #d97706;
                color: #92400e;
            }
            
            [data-theme="dark"] .diff-item.added {
                background-color: #14532d;
                color: #bbf7d0;
            }
            
            [data-theme="dark"] .diff-item.deleted {
                background-color: #7f1d1d;
                color: #fecaca;
            }
            
            [data-theme="dark"] .diff-item.changed {
                background-color: #78350f;
                color: #fed7aa;
            }
            
            @media (max-width: 768px) {
                .stats-container {
                    gap: 15px;
                }
                
                .stat-item {
                    min-width: 70px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 初始化二维码生成工具
     */
    initQrcodeTool() {
        const btn = document.getElementById('generateQrcode');
        if (!btn) return;
        btn.addEventListener('click', function() {
            const text = document.getElementById('qrcodeInput').value.trim();
            const size = parseInt(document.getElementById('qrcodeSize').value, 10);
            const color = document.getElementById('qrcodeColor').value;
            const bgColor = document.getElementById('qrcodeBgColor').value;
            const output = document.getElementById('qrcodeOutput');
            output.innerHTML = '';
            if (!text) {
                alert('请输入要生成二维码的内容');
                return;
            }
            // 使用qrcodejs2标准库生成二维码
            const qrcode = new QRCode(output, {
                text: text,
                width: size,
                height: size,
                colorDark: color,
                colorLight: bgColor,
                correctLevel: QRCode.CorrectLevel.H
            });
            // 显示下载按钮
            const downloadBtn = document.getElementById('downloadQrcode');
            if (downloadBtn) {
                downloadBtn.style.display = '';
                downloadBtn.onclick = function() {
                    // 获取canvas或img
                    let img = output.querySelector('img');
                    let url = '';
                    if (img) {
                        url = img.src;
                    } else {
                        // fallback: canvas
                        const canvas = output.querySelector('canvas');
                        if (canvas) url = canvas.toDataURL('image/png');
                    }
                    if (url) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'qrcode.png';
                        a.click();
                    }
                };
            }
        });
    }

    /**
     * 初始化二维码解析工具
     */
    initQrcodeDecodeTool() {
        const fileInput = document.getElementById('qrcodeImageInput');
        const decodeBtn = document.getElementById('decodeQrcode');
        const clearBtn = document.getElementById('clearQrcodeDecode');
        const uploadArea = document.getElementById('qrcodeUploadArea');
        const preview = document.getElementById('qrcodePreview');
        const result = document.getElementById('qrcodeDecodeResult');
        const copyBtn = document.getElementById('copyQrcodeResult');

        if (!fileInput || !decodeBtn || !uploadArea || !preview || !result) return;

        // 文件选择激活按钮和预览
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files.length > 0) {
                decodeBtn.disabled = false;
                showImagePreview(fileInput.files[0]);
            } else {
                decodeBtn.disabled = true;
                preview.innerHTML = '';
            }
            result.innerHTML = '';
            copyBtn && (copyBtn.style.display = 'none');
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                fileInput.files = files;
                decodeBtn.disabled = false;
                showImagePreview(files[0]);
            }
            result.innerHTML = '';
            copyBtn && (copyBtn.style.display = 'none');
        });

        // 点击上传区域也触发文件选择
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });

        // 解析二维码按钮
        decodeBtn.addEventListener('click', function() {
            if (!fileInput.files || fileInput.files.length === 0) return;
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    const imageData = ctx.getImageData(0, 0, img.width, img.height);
                    if (window.jsQR) {
                        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
                        if (code && code.data) {
                            result.innerHTML = `<span style='color: #22c55e;'>${code.data}</span>`;
                            if (copyBtn) {
                                copyBtn.style.display = '';
                                copyBtn.onclick = function() {
                                    navigator.clipboard.writeText(code.data);
                                    copyBtn.innerText = '已复制';
                                    setTimeout(() => { copyBtn.innerText = '复制结果'; }, 1200);
                                };
                            }
                        } else {
                            result.innerHTML = '<span style="color: #f87171;">未识别到二维码内容</span>';
                            copyBtn && (copyBtn.style.display = 'none');
                        }
                    } else {
                        result.innerHTML = '<span style="color: #f87171;">jsQR库未正确加载</span>';
                        copyBtn && (copyBtn.style.display = 'none');
                    }
                };
                img.src = e.target.result;
                preview.innerHTML = '';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });

        // 清空按钮
        clearBtn && clearBtn.addEventListener('click', function() {
            fileInput.value = '';
            preview.innerHTML = '';
            result.innerHTML = '';
            decodeBtn.disabled = true;
            copyBtn && (copyBtn.style.display = 'none');
        });

        // 预览图片
        function showImagePreview(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                preview.innerHTML = '';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }

    // 初始化时间戳转换工具
    initTimestampTool() {
        const convertTimestampBtn = document.getElementById('convertTimestamp');
        const convertDateTimeBtn = document.getElementById('convertDateTime');
        if (convertTimestampBtn) {
            convertTimestampBtn.addEventListener('click', () => {
                this.convertTimestampToDate();
            });
        }
        if (convertDateTimeBtn) {
            convertDateTimeBtn.addEventListener('click', () => {
                this.convertDateToTimestamp();
            });
        }

        // 初始化时间选择器
        this.initTimePickerControls();
        
        // 设置当前时间为默认值
        this.setCurrentTimeToInputs();
    }

    // 初始化时间选择器控件
    initTimePickerControls() {
        const dateTimeInput = document.getElementById('dateTimeInput');
        const hourInput = document.getElementById('hourInput');
        const minuteInput = document.getElementById('minuteInput');
        const secondInput = document.getElementById('secondInput');
        const setCurrentTimeBtn = document.getElementById('setCurrentTime');
        const resetTimeBtn = document.getElementById('resetTime');

        // 当datetime-local输入改变时，同步到时分秒输入框
        if (dateTimeInput) {
            dateTimeInput.addEventListener('change', () => {
                this.syncTimeFromDateTimeInput();
            });
        }

        // 当时分秒输入框改变时，同步到datetime-local输入框
        [hourInput, minuteInput, secondInput].forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    this.syncTimeToDateTimeInput();
                });
                input.addEventListener('input', () => {
                    this.syncTimeToDateTimeInput();
                });
            }
        });

        // 设置当前时间按钮
        if (setCurrentTimeBtn) {
            setCurrentTimeBtn.addEventListener('click', () => {
                this.setCurrentTimeToInputs();
            });
        }

        // 重置时间按钮
        if (resetTimeBtn) {
            resetTimeBtn.addEventListener('click', () => {
                this.resetTimeInputs();
            });
        }
    }

    // 设置当前时间到所有输入框
    setCurrentTimeToInputs() {
        const now = new Date();
        
        // 设置日期时间输入框（精确到秒）
        const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString().slice(0, 19);
        const dateTimeInput = document.getElementById('dateTimeInput');
        if (dateTimeInput) {
            dateTimeInput.value = localDateTime;
        }

        // 设置时分秒输入框
        const hourInput = document.getElementById('hourInput');
        const minuteInput = document.getElementById('minuteInput');
        const secondInput = document.getElementById('secondInput');
        
        if (hourInput) hourInput.value = now.getHours();
        if (minuteInput) minuteInput.value = now.getMinutes();
        if (secondInput) secondInput.value = now.getSeconds();
    }

    // 重置时间输入框
    resetTimeInputs() {
        const hourInput = document.getElementById('hourInput');
        const minuteInput = document.getElementById('minuteInput');
        const secondInput = document.getElementById('secondInput');
        
        if (hourInput) hourInput.value = 0;
        if (minuteInput) minuteInput.value = 0;
        if (secondInput) secondInput.value = 0;
        
        this.syncTimeToDateTimeInput();
    }

    // 从datetime-local输入框同步时间到时分秒输入框
    syncTimeFromDateTimeInput() {
        const dateTimeInput = document.getElementById('dateTimeInput');
        if (!dateTimeInput || !dateTimeInput.value) return;

        const date = new Date(dateTimeInput.value);
        const hourInput = document.getElementById('hourInput');
        const minuteInput = document.getElementById('minuteInput');
        const secondInput = document.getElementById('secondInput');
        
        if (hourInput) hourInput.value = date.getHours();
        if (minuteInput) minuteInput.value = date.getMinutes();
        if (secondInput) secondInput.value = date.getSeconds();
    }

    // 从时分秒输入框同步时间到datetime-local输入框
    syncTimeToDateTimeInput() {
        const dateTimeInput = document.getElementById('dateTimeInput');
        const hourInput = document.getElementById('hourInput');
        const minuteInput = document.getElementById('minuteInput');
        const secondInput = document.getElementById('secondInput');
        
        if (!dateTimeInput || !hourInput || !minuteInput || !secondInput) return;

        // 获取当前日期部分
        let currentValue = dateTimeInput.value;
        if (!currentValue) {
            // 如果没有值，使用今天的日期
            const today = new Date();
            currentValue = today.toISOString().slice(0, 10) + 'T00:00:00';
        }

        // 解析当前日期
        const datePart = currentValue.split('T')[0];
        
        // 构建新的日期时间字符串
        const hour = String(parseInt(hourInput.value) || 0).padStart(2, '0');
        const minute = String(parseInt(minuteInput.value) || 0).padStart(2, '0');
        const second = String(parseInt(secondInput.value) || 0).padStart(2, '0');
        
        dateTimeInput.value = `${datePart}T${hour}:${minute}:${second}`;
    }

    // 定时显示当前时间
    updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            const timestamp = Math.floor(now.getTime() / 1000);
            const dateTime = now.toLocaleString('zh-CN');
            const timestampDisplay = document.getElementById('currentTimestamp');
            const dateTimeDisplay = document.getElementById('currentDateTime');
            if (timestampDisplay) timestampDisplay.textContent = timestamp;
            if (dateTimeDisplay) dateTimeDisplay.textContent = dateTime;
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    // 时间戳转日期
    convertTimestampToDate() {
        const input = document.getElementById('timestampInput').value.trim();
        const output = document.getElementById('timestampResult');
        const unitRadio = document.querySelector('input[name="timestampUnit"]:checked');
        const unit = unitRadio ? unitRadio.value : 'seconds';
        if (!input) {
            if (output) output.innerHTML = '请输入时间戳';
            return;
        }
        try {
            let timestamp = parseInt(input);
            if (unit === 'seconds') {
                timestamp *= 1000;
            }
            const date = new Date(timestamp);
            const result = `
                <div><strong>本地时间:</strong> ${date.toLocaleString('zh-CN')}</div>
                <div><strong>UTC时间:</strong> ${date.toUTCString()}</div>
                <div><strong>ISO格式:</strong> ${date.toISOString()}</div>
                <div><strong>Unix时间戳(秒):</strong> ${Math.floor(timestamp / 1000)}</div>
                <div><strong>Unix时间戳(毫秒):</strong> ${timestamp}</div>
            `;
            if (output) output.innerHTML = result;
        } catch (error) {
            if (output) output.innerHTML = `转换错误: ${error.message}`;
        }
    }

    // 日期转时间戳
    convertDateToTimestamp() {
        const input = document.getElementById('dateTimeInput').value;
        const output = document.getElementById('dateTimeResult');
        if (!input) {
            if (output) output.innerHTML = '请选择日期时间';
            return;
        }
        try {
            const date = new Date(input);
            const timestamp = date.getTime();
            const timestampSeconds = Math.floor(timestamp / 1000);
            const result = `
                <div><strong>Unix时间戳(秒):</strong> ${timestampSeconds}</div>
                <div><strong>Unix时间戳(毫秒):</strong> ${timestamp}</div>
                <div><strong>本地时间:</strong> ${date.toLocaleString('zh-CN')}</div>
                <div><strong>UTC时间:</strong> ${date.toUTCString()}</div>
                <div><strong>ISO格式:</strong> ${date.toISOString()}</div>
            `;
            if (output) output.innerHTML = result;
        } catch (error) {
            if (output) output.innerHTML = `转换错误: ${error.message}`;
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new SSDevToolsApp();
        window.app.init();
    } catch (error) {
        console.error('应用启动失败:', error);
    }
}); 