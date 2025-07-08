/**
 * 可折叠格式化组件 - 支持JSON和XML的可折叠展示
 */
class CollapsibleFormatter {
    constructor() {
        this.nodeIdCounter = 0;
    }

    /**
     * 格式化JSON为可折叠的HTML
     * @param {Object} obj - 解析后的JSON对象
     * @param {string} containerId - 容器ID
     */
    formatJSON(obj, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 清空容器
        container.innerHTML = '';
        
        // 创建可折叠的HTML结构
        const html = this.createJSONHTML(obj, 0);
        container.innerHTML = html;
        
        // 绑定折叠/展开事件
        this.bindCollapseEvents(container);
        
        // 更新容器类名
        container.className = 'collapsible-output';
    }

    /**
     * 递归创建JSON的HTML结构
     */
    createJSONHTML(value, level = 0, isLast = true) {
        const indent = '  '.repeat(level);
        const nodeId = `node_${++this.nodeIdCounter}`;

        if (value === null) {
            return `<span class="json-null">null</span>`;
        }

        if (typeof value === 'string') {
            return `<span class="json-string">"${this.escapeHtml(value)}"</span>`;
        }

        if (typeof value === 'number') {
            return `<span class="json-number">${value}</span>`;
        }

        if (typeof value === 'boolean') {
            return `<span class="json-boolean">${value}</span>`;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '<span class="json-punctuation">[]</span>';
            }

            let html = '<div class="collapsible-node">';
            html += `<div class="collapsible-line">`;
            html += `<button class="collapse-toggle" data-target="${nodeId}"></button>`;
            html += '<span class="json-punctuation">[</span>';
            html += `<span class="collapse-ellipsis" data-target="${nodeId}">...${value.length} items</span>`;
            html += '</div>';
            
            html += `<div id="${nodeId}" class="collapsible-content">`;
            value.forEach((item, index) => {
                const isLastItem = index === value.length - 1;
                html += '<div class="collapsible-line">';
                html += this.createJSONHTML(item, level + 1, isLastItem);
                if (!isLastItem) html += '<span class="json-punctuation">,</span>';
                html += '</div>';
            });
            html += '<div class="collapsible-line"><span class="json-punctuation">]</span></div>';
            html += '</div>';
            html += '</div>';

            return html;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return '<span class="json-punctuation">{}</span>';
            }

            let html = '<div class="collapsible-node">';
            html += `<div class="collapsible-line">`;
            html += `<button class="collapse-toggle" data-target="${nodeId}"></button>`;
            html += '<span class="json-punctuation">{</span>';
            html += `<span class="collapse-ellipsis" data-target="${nodeId}">...${keys.length} properties</span>`;
            html += '</div>';
            
            html += `<div id="${nodeId}" class="collapsible-content">`;
            keys.forEach((key, index) => {
                const isLastKey = index === keys.length - 1;
                html += '<div class="collapsible-line">';
                html += `<span class="json-key">"${this.escapeHtml(key)}"</span>`;
                html += '<span class="json-punctuation">: </span>';
                html += this.createJSONHTML(value[key], level + 1, isLastKey);
                if (!isLastKey) html += '<span class="json-punctuation">,</span>';
                html += '</div>';
            });
            html += '<div class="collapsible-line"><span class="json-punctuation">}</span></div>';
            html += '</div>';
            html += '</div>';

            return html;
        }

        return String(value);
    }

    /**
     * 格式化XML为可折叠的HTML
     * @param {string} xmlString - XML字符串
     * @param {string} containerId - 容器ID
     */
    formatXML(xmlString, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            
            // 检查解析错误
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                throw new Error('XML格式错误');
            }

            // 清空容器
            container.innerHTML = '';
            
            // 创建可折叠的HTML结构
            const html = this.createXMLHTML(xmlDoc.documentElement, 0);
            container.innerHTML = html;
            
            // 绑定折叠/展开事件
            this.bindCollapseEvents(container);
            
            // 更新容器类名
            container.className = 'collapsible-output';
            
        } catch (error) {
            container.innerHTML = `<div class="error">XML解析错误: ${error.message}</div>`;
            container.className = 'collapsible-output error';
        }
    }

    /**
     * 递归创建XML的HTML结构
     */
    createXMLHTML(element, level = 0) {
        const indent = '  '.repeat(level);
        const nodeId = `node_${++this.nodeIdCounter}`;
        const tagName = element.tagName;
        
        // 处理属性
        let attributes = '';
        if (element.attributes && element.attributes.length > 0) {
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                attributes += ` <span class="xml-attribute">${attr.name}</span>=<span class="xml-value">"${this.escapeHtml(attr.value)}"</span>`;
            }
        }

        // 检查是否有子元素
        const hasChildren = element.children.length > 0;
        const textContent = element.textContent.trim();
        const hasText = textContent && !hasChildren;

        if (!hasChildren && !hasText) {
            // 自闭合标签
            return `<div class="collapsible-line">&lt;<span class="xml-tag">${tagName}</span>${attributes} /&gt;</div>`;
        }

        if (!hasChildren && hasText) {
            // 只有文本内容的标签
            return `<div class="collapsible-line">&lt;<span class="xml-tag">${tagName}</span>${attributes}&gt;<span class="xml-content">${this.escapeHtml(textContent)}</span>&lt;/<span class="xml-tag">${tagName}</span>&gt;</div>`;
        }

        // 有子元素的标签
        let html = '<div class="collapsible-node">';
        html += `<div class="collapsible-line">`;
        html += `<button class="collapse-toggle" data-target="${nodeId}"></button>`;
        html += `&lt;<span class="xml-tag">${tagName}</span>${attributes}&gt;`;
        html += `<span class="collapse-ellipsis" data-target="${nodeId}">...${element.children.length} elements</span>`;
        html += '</div>';
        
        html += `<div id="${nodeId}" class="collapsible-content">`;
        
        // 处理子元素
        for (let i = 0; i < element.children.length; i++) {
            html += this.createXMLHTML(element.children[i], level + 1);
        }
        
        html += `<div class="collapsible-line">&lt;/<span class="xml-tag">${tagName}</span>&gt;</div>`;
        html += '</div>';
        html += '</div>';

        return html;
    }

    /**
     * 绑定折叠/展开事件
     */
    bindCollapseEvents(container) {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('collapse-toggle') || e.target.classList.contains('collapse-ellipsis')) {
                const targetId = e.target.dataset.target;
                const targetElement = document.getElementById(targetId);
                const toggleButton = container.querySelector(`[data-target="${targetId}"].collapse-toggle`);
                
                if (targetElement && toggleButton) {
                    const isCollapsed = targetElement.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        targetElement.classList.remove('collapsed');
                        toggleButton.classList.remove('collapsed');
                    } else {
                        targetElement.classList.add('collapsed');
                        toggleButton.classList.add('collapsed');
                    }
                }
            }
        });
    }

    /**
     * 展开所有节点
     */
    expandAll(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const collapsedElements = container.querySelectorAll('.collapsible-content.collapsed');
        const collapsedToggles = container.querySelectorAll('.collapse-toggle.collapsed');
        
        collapsedElements.forEach(element => element.classList.remove('collapsed'));
        collapsedToggles.forEach(toggle => toggle.classList.remove('collapsed'));
    }

    /**
     * 折叠所有节点
     */
    collapseAll(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const expandedElements = container.querySelectorAll('.collapsible-content:not(.collapsed)');
        const expandedToggles = container.querySelectorAll('.collapse-toggle:not(.collapsed)');
        
        expandedElements.forEach(element => element.classList.add('collapsed'));
        expandedToggles.forEach(toggle => toggle.classList.add('collapsed'));
    }

    /**
     * 获取纯文本内容（用于复制）
     */
    getPlainText(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return '';

        // 如果容器没有可折叠内容，直接返回文本
        if (!container.querySelector('.collapsible-node')) {
            return container.textContent || container.innerText || '';
        }

        // 临时展开所有节点以获取完整文本
        const collapsedElements = Array.from(container.querySelectorAll('.collapsible-content.collapsed'));
        const collapsedToggles = Array.from(container.querySelectorAll('.collapse-toggle.collapsed'));
        
        // 展开所有折叠的内容
        collapsedElements.forEach(element => element.classList.remove('collapsed'));
        collapsedToggles.forEach(toggle => toggle.classList.remove('collapsed'));

        // 隐藏所有折叠按钮和省略号，只获取实际内容
        const toggles = container.querySelectorAll('.collapse-toggle');
        const ellipsis = container.querySelectorAll('.collapse-ellipsis');
        
        toggles.forEach(el => el.style.display = 'none');
        ellipsis.forEach(el => el.style.display = 'none');

        // 获取文本内容
        let text = container.innerText || container.textContent || '';
        
        // 清理多余的空白字符
        text = text.replace(/\n\s*\n/g, '\n').trim();
        
        // 恢复显示
        toggles.forEach(el => el.style.display = '');
        ellipsis.forEach(el => el.style.display = '');
        
        // 恢复折叠状态
        collapsedElements.forEach(element => element.classList.add('collapsed'));
        collapsedToggles.forEach(toggle => toggle.classList.add('collapsed'));

        return text;
    }

    /**
     * 转义HTML字符
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示错误信息
     */
    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `<div class="error">${message}</div>`;
        container.className = 'collapsible-output error';
    }

    /**
     * 显示占位符
     */
    showPlaceholder(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'collapsible-output';
        container.setAttribute('data-placeholder', message);
    }
} 