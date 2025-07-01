/**
 * 基础工具类 - 提供所有工具的通用功能
 */
class BaseTool {
    constructor() {
        this.name = '';
    }

    // 显示错误信息
    showError(element, message) {
        if (element.tagName === 'TEXTAREA') {
            element.value = `错误: ${message}`;
            element.className = element.className.replace(/\berror\b/, '') + ' error';
        } else {
            element.innerHTML = `<div class="error">
                <div class="error-title">错误</div>
                <div class="error-message">${message}</div>
            </div>`;
        }
    }

    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('复制成功！', 'success');
        } catch (error) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('复制成功！', 'success');
        }
    }

    // 显示提示信息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: var(--border-radius);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            toast.style.background = 'var(--success-color)';
        } else if (type === 'error') {
            toast.style.background = 'var(--error-color)';
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 显示统计信息
    showStats(originalData, processedData, outputElement, type = 'compression') {
        const originalSize = new Blob([originalData]).size;
        const processedSize = new Blob([processedData]).size;
        
        let statsHTML;
        if (type === 'compression') {
            const savings = originalSize - processedSize;
            const savingsPercent = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : 0;
            
            statsHTML = `
                <div class="stat-item">
                    <span class="stat-label">原始大小:</span>
                    <span class="stat-value">${this.formatFileSize(originalSize)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">压缩后:</span>
                    <span class="stat-value">${this.formatFileSize(processedSize)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">节省:</span>
                    <span class="stat-value">${this.formatFileSize(savings)} (${savingsPercent}%)</span>
                </div>
            `;
        } else if (type === 'format') {
            const increase = processedSize - originalSize;
            const increasePercent = originalSize > 0 ? ((increase / originalSize) * 100).toFixed(1) : 0;
            
            statsHTML = `
                <div class="stat-item">
                    <span class="stat-label">原始大小:</span>
                    <span class="stat-value">${this.formatFileSize(originalSize)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">格式化后:</span>
                    <span class="stat-value">${this.formatFileSize(processedSize)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">增加:</span>
                    <span class="stat-value">${this.formatFileSize(increase)} (${increasePercent}%)</span>
                </div>
            `;
        }
        
        // 创建统计信息元素
        const statsElement = document.createElement('div');
        statsElement.className = 'stats-container';
        statsElement.innerHTML = statsHTML;
        
        // 移除已存在的统计信息
        const existingStats = outputElement.parentNode.querySelector('.stats-container');
        if (existingStats) {
            existingStats.remove();
        }
        
        // 添加新的统计信息
        outputElement.parentNode.insertBefore(statsElement, outputElement.nextSibling);
    }

    // 抽象方法，子类必须实现
    init() {
        throw new Error('子类必须实现 init 方法');
    }
} 