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
        this.addAnimationStyles();
        
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
            this.showTool('welcome');
            
        } catch (error) {
            console.error('工具初始化失败:', error);
        }
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