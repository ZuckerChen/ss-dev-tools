/**
 * XML工具类 - 处理XML解析、格式化、压缩
 */
class XMLTool extends BaseTool {
    constructor() {
        super();
        this.name = 'XML工具';
        this.formatter = new CollapsibleFormatter();
        this.lastFormattedText = ''; // 保存最后格式化的文本
    }

    init() {
        this.initXMLParser();
    }

    // 初始化XML解析工具
    initXMLParser() {
        document.getElementById('formatXml')?.addEventListener('click', () => {
            this.formatXML();
        });
        
        document.getElementById('compressXml')?.addEventListener('click', () => {
            this.compressXML();
        });
        
        document.getElementById('clearXml')?.addEventListener('click', () => {
            this.clearXML();
        });
        
        document.getElementById('copyXmlResult')?.addEventListener('click', () => {
            this.copyXMLResult();
        });
        
        document.getElementById('syncXmlResult')?.addEventListener('click', () => {
            this.syncXMLResult();
        });
    }

    // 格式化XML
    formatXML() {
        const input = document.getElementById('xmlInput').value.trim();
        const output = document.getElementById('xmlOutput');
        
        if (!input) {
            this.formatter.showPlaceholder('xmlOutput', '请输入XML数据');
            this.lastFormattedText = '';
            return;
        }
        
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(input, 'text/xml');
            
            // 检查解析错误
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                throw new Error('XML格式错误: ' + parseError[0].textContent);
            }
            
            // 生成格式化的文本并保存
            const formatted = this.formatXMLString(input);
            this.lastFormattedText = formatted;
            
            // 使用可折叠格式化器
            this.formatter.formatXML(input, 'xmlOutput');
            
            // 添加展开/折叠控制按钮
            this.addCollapseControls('xmlOutput');
            
            // 显示格式化统计信息
            this.showStats(input, formatted, output, 'format');
        } catch (error) {
            this.formatter.showError('xmlOutput', error.message);
            this.lastFormattedText = '';
        }
    }

    // 压缩XML
    compressXML() {
        const input = document.getElementById('xmlInput').value.trim();
        const output = document.getElementById('xmlOutput');
        
        if (!input) {
            this.formatter.showPlaceholder('xmlOutput', '请输入XML数据');
            this.lastFormattedText = '';
            return;
        }
        
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(input, 'text/xml');
            
            // 检查解析错误
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                throw new Error('XML格式错误: ' + parseError[0].textContent);
            }
            
            // 真正的压缩：去掉标签间的空白，保留标签内的必要空格，但去掉多余空白
            let compressed = input
                .replace(/>\s+</g, '><')  // 去掉标签间的空白
                .replace(/\s+/g, ' ')     // 将多个空白字符替换为单个空格
                .replace(/\s*=\s*/g, '=') // 去掉等号周围的空格
                .replace(/>\s+/g, '>')    // 去掉标签结束后的空格
                .replace(/\s+</g, '<')    // 去掉标签开始前的空格
                .trim();
            
            // 保存压缩后的文本
            this.lastFormattedText = compressed;
            
            // 压缩后显示纯文本
            output.innerHTML = `<div style="font-family: monospace; white-space: pre-wrap; word-break: break-all;">${this.escapeHtml(compressed)}</div>`;
            output.className = 'collapsible-output';
            
            // 显示压缩统计信息
            this.showStats(input, compressed, output, 'compression');
        } catch (error) {
            this.formatter.showError('xmlOutput', error.message);
            this.lastFormattedText = '';
        }
    }

    // 清空XML
    clearXML() {
        document.getElementById('xmlInput').value = '';
        const output = document.getElementById('xmlOutput');
        
        // 清空保存的文本
        this.lastFormattedText = '';
        
        // 显示占位符
        this.formatter.showPlaceholder('xmlOutput', '格式化结果将在这里显示...');
        
        // 移除统计信息
        const existingStats = output.parentNode.querySelector('.stats-container');
        if (existingStats) {
            existingStats.remove();
        }
        
        // 移除控制按钮
        this.removeCollapseControls('xmlOutput');
    }

    // 复制XML结果
    copyXMLResult() {
        // 优先使用保存的格式化文本，确保缩进正确
        let content = this.lastFormattedText;
        
        // 如果没有保存的文本，尝试从HTML中提取
        if (!content) {
            content = this.formatter.getPlainText('xmlOutput') || 
                     document.getElementById('xmlOutput').textContent ||
                     document.getElementById('xmlOutput').innerText;
        }
        
        this.copyToClipboard(content);
    }

    // 同步XML结果到输入框
    syncXMLResult() {
        const input = document.getElementById('xmlInput');
        
        // 优先使用保存的格式化文本，确保缩进正确
        let content = this.lastFormattedText;
        
        // 如果没有保存的文本，尝试从HTML中提取
        if (!content) {
            content = this.formatter.getPlainText('xmlOutput') || 
                     document.getElementById('xmlOutput').textContent ||
                     document.getElementById('xmlOutput').innerText;
        }
        
        if (content && content.trim()) {
            try {
                // 验证XML格式
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(content, 'text/xml');
                const parseError = xmlDoc.getElementsByTagName('parsererror');
                
                if (parseError.length > 0) {
                    throw new Error('XML格式错误');
                }
                
                input.value = content;
                this.showToast('已同步到输入框！', 'success');
            } catch (error) {
                this.showToast('输出内容不是有效的XML格式', 'error');
            }
        } else {
            this.showToast('输出区域为空', 'error');
        }
    }

    // 格式化XML字符串
    formatXMLString(xml) {
        let formatted = '';
        let indent = 0;
        const tab = '  ';
        
        xml = xml.replace(/>\s*</g, '><');
        
        const tokens = xml.split('<');
        tokens.forEach((token, index) => {
            if (index === 0) {
                if (token.trim()) {
                    formatted += token;
                }
                return;
            }
            
            const isClosingTag = token.charAt(0) === '/';
            const isSelfClosing = token.endsWith('/>');
            const isComment = token.startsWith('!--');
            const isDeclaration = token.startsWith('?') || token.startsWith('!');
            
            if (isClosingTag) {
                indent--;
            }
            
            if (!isComment && !isDeclaration) {
                formatted += '\n' + tab.repeat(Math.max(0, indent));
            }
            
            formatted += '<' + token;
            
            if (!isClosingTag && !isSelfClosing && !isComment && !isDeclaration) {
                indent++;
            }
        });
        
        return formatted.trim();
    }

    // 显示XML错误
    showXMLError(element, message) {
        if (element.tagName === 'TEXTAREA') {
            element.value = `XML解析错误: ${message}`;
            element.className = 'xml-output-textarea error';
        } else {
            element.innerHTML = `<div class="xml-error">
                <div class="xml-error-title">XML解析错误</div>
                <div class="xml-error-message">${message}</div>
            </div>`;
            element.className = 'xml-output';
        }
    }

    // 添加展开/折叠控制按钮
    addCollapseControls(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 检查是否已存在控制按钮
        const existingControls = container.parentNode.querySelector('.collapse-controls');
        if (existingControls) return;

        // 创建控制按钮容器
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'collapse-controls';

        // 展开所有按钮
        const expandAllBtn = document.createElement('button');
        expandAllBtn.textContent = '展开所有';
        expandAllBtn.className = 'btn secondary';
        expandAllBtn.onclick = () => this.formatter.expandAll(containerId);

        // 折叠所有按钮
        const collapseAllBtn = document.createElement('button');
        collapseAllBtn.textContent = '折叠所有';
        collapseAllBtn.className = 'btn secondary';
        collapseAllBtn.onclick = () => this.formatter.collapseAll(containerId);

        controlsDiv.appendChild(expandAllBtn);
        controlsDiv.appendChild(collapseAllBtn);

        // 插入到输出容器前面
        container.parentNode.insertBefore(controlsDiv, container);
    }

    // 移除展开/折叠控制按钮
    removeCollapseControls(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const existingControls = container.parentNode.querySelector('.collapse-controls');
        if (existingControls) {
            existingControls.remove();
        }
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
} 