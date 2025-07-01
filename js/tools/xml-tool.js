/**
 * XML工具类 - 处理XML解析、格式化、压缩
 */
class XMLTool extends BaseTool {
    constructor() {
        super();
        this.name = 'XML工具';
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
            this.showError(output, '请输入XML数据');
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
            
            const formatted = this.formatXMLString(input);
            output.value = formatted;
            output.className = 'xml-output-textarea';
            
            // 显示格式化统计信息
            this.showStats(input, formatted, output, 'format');
        } catch (error) {
            this.showXMLError(output, error.message);
        }
    }

    // 压缩XML
    compressXML() {
        const input = document.getElementById('xmlInput').value.trim();
        const output = document.getElementById('xmlOutput');
        
        if (!input) {
            this.showError(output, '请输入XML数据');
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
            
            output.value = compressed;
            output.className = 'xml-output-textarea';
            
            // 显示压缩统计信息
            this.showStats(input, compressed, output, 'compression');
        } catch (error) {
            this.showXMLError(output, error.message);
        }
    }

    // 清空XML
    clearXML() {
        document.getElementById('xmlInput').value = '';
        const output = document.getElementById('xmlOutput');
        output.value = '';
        output.innerHTML = '';
        
        // 移除统计信息
        const existingStats = output.parentNode.querySelector('.stats-container');
        if (existingStats) {
            existingStats.remove();
        }
    }

    // 复制XML结果
    copyXMLResult() {
        const output = document.getElementById('xmlOutput');
        const content = output.value || output.textContent;
        this.copyToClipboard(content);
    }

    // 同步XML结果到输入框
    syncXMLResult() {
        const output = document.getElementById('xmlOutput');
        const input = document.getElementById('xmlInput');
        const content = output.value || output.textContent || output.innerText;
        
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
} 