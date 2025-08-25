/**
 * JSON工具类 - 处理JSON解析、格式化、压缩、转换、对比
 */
class JSONTool extends BaseTool {
    constructor() {
        super();
        this.name = 'JSON工具';
        this.formatter = new CollapsibleFormatter();
        this.lastFormattedText = ''; // 保存最后格式化的文本
    }

    init() {
        this.initJSONParser();
        // 已移除JSON转换功能
        this.initJSONComparator();
        this.currentMode = 'text'; // 当前模式：text 或 formatted
        this.originalJSON = null; // 保存原始JSON对象
    }

    // 初始化JSON解析工具
    initJSONParser() {
        document.getElementById('formatJson')?.addEventListener('click', () => {
            this.formatJSON();
        });
        
        document.getElementById('compressJson')?.addEventListener('click', () => {
            this.compressJSON();
        });
        
        document.getElementById('clearJson')?.addEventListener('click', () => {
            this.clearJSON();
        });
        
        document.getElementById('copyJsonResult')?.addEventListener('click', () => {
            this.copyCurrentContent();
        });
        
        // 监听输入框变化，重置缓存的原始数据
        document.getElementById('jsonInput')?.addEventListener('input', () => {
            this.originalJSON = null;
            if (this.currentMode === 'formatted') {
                this.switchToTextMode();
            }
        });
    }

    // JSON转换功能已下线
    initJSONConverter() {}

    // 初始化JSON对比工具
    initJSONComparator() {
        document.getElementById('compareJson')?.addEventListener('click', () => {
            this.compareJSON();
        });
        
        document.getElementById('clearCompare')?.addEventListener('click', () => {
            document.getElementById('jsonLeft').value = '';
            document.getElementById('jsonRight').value = '';
            document.getElementById('compareOutput').innerHTML = '';
        });
    }

    // 格式化JSON
    formatJSON() {
        const inputElement = document.getElementById('jsonInput');
        const outputElement = document.getElementById('jsonOutput');
        
        if (this.currentMode === 'formatted') {
            // 如果当前是格式化模式，切换回文本模式
            this.switchToTextMode();
            return;
        }
        
        const input = inputElement.value.trim();
        
        if (!input) {
            this.updateStatus('请输入JSON数据', 'warning');
            return;
        }
        
        try {
            // 只在第一次格式化时解析，避免重复转换导致BigInt变为字符串
            let parsed;
            if (this.originalJSON === null) {
                parsed = this.parseJSONWithBigInt(input);
                this.originalJSON = parsed; // 保存原始解析结果
            } else {
                parsed = this.originalJSON; // 使用保存的原始数据
            }
            
            // 生成格式化的文本并保存
            const formatted = this.stringifyJSONWithBigInt(parsed, null, 2);
            this.lastFormattedText = formatted;
            
            // 更新输入框内容为格式化后的文本
            inputElement.value = formatted;
            
            // 切换到格式化显示模式
            this.switchToFormattedMode();
            
            // 使用可折叠格式化器显示
            this.formatter.formatJSON(parsed, 'jsonOutput');
            
            // 更新状态和统计
            this.updateStatus('格式化完成', 'success');
            this.updateStats(input, formatted, 'format');
            
        } catch (error) {
            this.updateStatus(`JSON格式错误: ${error.message}`, 'error');
            this.lastFormattedText = '';
            this.originalJSON = null;
        }
    }

    // 压缩JSON
    compressJSON() {
        const inputElement = document.getElementById('jsonInput');
        const input = inputElement.value.trim();
        
        if (!input) {
            this.updateStatus('请输入JSON数据', 'warning');
            return;
        }
        
        try {
            // 使用原始JSON数据或重新解析
            let parsed;
            if (this.originalJSON !== null) {
                parsed = this.originalJSON;
            } else {
                parsed = this.parseJSONWithBigInt(input);
                this.originalJSON = parsed;
            }
            
            const compressed = this.stringifyJSONWithBigInt(parsed);
            
            // 保存压缩后的文本
            this.lastFormattedText = compressed;
            
            // 更新输入框内容为压缩后的文本
            inputElement.value = compressed;
            
            // 切换到文本模式
            this.switchToTextMode();
            
            // 更新状态和统计
            this.updateStatus('压缩完成', 'success');
            this.updateStats(input, compressed, 'compression');
            
        } catch (error) {
            this.updateStatus(`JSON格式错误: ${error.message}`, 'error');
            this.lastFormattedText = '';
            this.originalJSON = null;
        }
    }

    // 清空JSON
    clearJSON() {
        document.getElementById('jsonInput').value = '';
        
        // 清空保存的数据
        this.lastFormattedText = '';
        this.originalJSON = null;
        
        // 清空格式化显示
        this.formatter.showPlaceholder('jsonOutput', '格式化后将在这里显示可折叠的JSON结构...');
        
        // 切换到文本模式
        this.switchToTextMode();
        
        // 更新状态
        this.updateStatus('已清空', 'info');
        this.updateStats('', '', 'clear');
    }

    // 复制当前内容
    copyCurrentContent() {
        const input = document.getElementById('jsonInput').value;
        if (input.trim()) {
            this.copyToClipboard(input);
            this.updateStatus('已复制到剪贴板', 'success');
        } else {
            this.updateStatus('没有内容可复制', 'warning');
        }
    }



    // 切换到文本模式
    switchToTextMode() {
        this.currentMode = 'text';
        const inputElement = document.getElementById('jsonInput');
        const outputElement = document.getElementById('jsonOutput');
        
        // 显示文本编辑器，隐藏格式化显示器
        inputElement.style.display = 'block';
        outputElement.classList.remove('active');
    }

    // 切换到格式化模式
    switchToFormattedMode() {
        this.currentMode = 'formatted';
        const inputElement = document.getElementById('jsonInput');
        const outputElement = document.getElementById('jsonOutput');
        
        // 隐藏文本编辑器，显示格式化显示器
        inputElement.style.display = 'none';
        outputElement.classList.add('active');
    }

    // 更新状态显示
    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('jsonStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-text ${type}`;
        }
    }

    // 更新统计信息
    updateStats(originalData, processedData, type) {
        const statsElement = document.getElementById('jsonStats');
        if (!statsElement) return;

        if (type === 'clear') {
            statsElement.textContent = '';
            return;
        }

        const originalSize = new Blob([originalData]).size;
        const processedSize = new Blob([processedData]).size;

        if (type === 'compression') {
            const savings = originalSize - processedSize;
            const savingsPercent = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : 0;
            statsElement.textContent = `原始: ${this.formatFileSize(originalSize)} | 压缩后: ${this.formatFileSize(processedSize)} | 节省: ${savingsPercent}%`;
        } else if (type === 'format') {
            const increase = processedSize - originalSize;
            const increasePercent = originalSize > 0 ? ((increase / originalSize) * 100).toFixed(1) : 0;
            statsElement.textContent = `原始: ${this.formatFileSize(originalSize)} | 格式化后: ${this.formatFileSize(processedSize)} | 增加: ${increasePercent}%`;
        }
    }

    // JSON转换相关功能已移除

    generateJavaClass() { return ''; }

    getImports() { return ''; }

    generateFields() { return ''; }

    generateLombokAnnotations() { return ''; }

    generateLombokMethods() { return ''; }

    generateTraditionalMethods() { return ''; }

    generateGetters() { return ''; }

    generateSetters() { return ''; }

    generateConstructor() { return ''; }

    getJavaType() { return 'Object'; }

    isDateString() { return false; }

    needsDateImports() { return false; }

    needsListImports() { return false; }

    toCamelCase(str) { return str; }

    capitalize(str) { return str; }

    convertJavaToJSON() {}

    parseJavaToJSON() { return {}; }

    getDefaultValueForType() { return null; }

    // JSON对比
    compareJSON() {
        const leftInput = document.getElementById('jsonLeft').value.trim();
        const rightInput = document.getElementById('jsonRight').value.trim();
        const output = document.getElementById('compareOutput');
        
        if (!leftInput || !rightInput) {
            output.innerHTML = '<div class="error">请输入两个JSON数据进行对比</div>';
            return;
        }
        
        try {
            const leftObj = this.parseJSONWithBigInt(leftInput);
            const rightObj = this.parseJSONWithBigInt(rightInput);
            
            const differences = this.compareObjects(leftObj, rightObj);
            output.innerHTML = this.formatDifferences(differences);
        } catch (error) {
            output.innerHTML = `<div class="error">JSON格式错误: ${error.message}</div>`;
        }
    }

    // 对比两个对象
    compareObjects(obj1, obj2, path = '') {
        const differences = [];
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        
        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            const val1 = this.normalizeForCompare(obj1[key]);
            const val2 = this.normalizeForCompare(obj2[key]);
            
            if (!(key in obj1)) {
                differences.push({ type: 'added', path: currentPath, value: val2 });
            } else if (!(key in obj2)) {
                differences.push({ type: 'deleted', path: currentPath, value: val1 });
            } else if (!this.deepEqual(val1, val2)) {
                if (val1 !== null && val2 !== null) {
                    // 嵌套对象
                    if (typeof val1 === 'object' && typeof val2 === 'object' && !Array.isArray(val1) && !Array.isArray(val2)) {
                        differences.push(...this.compareObjects(val1, val2, currentPath));
                        continue;
                    }
                    // 数组
                    if (Array.isArray(val1) && Array.isArray(val2)) {
                        differences.push(...this.compareArrays(val1, val2, currentPath));
                        continue;
                    }
                }
                differences.push({ type: 'changed', path: currentPath, oldValue: val1, newValue: val2 });
            }
        }
        
        return differences;
    }

    // 对比数组
    compareArrays(arr1, arr2, path = '') {
        const diffs = [];
        const maxLen = Math.max(arr1.length, arr2.length);
        for (let i = 0; i < maxLen; i++) {
            const currentPath = `${path}[${i}]`;
            const v1 = i < arr1.length ? this.normalizeForCompare(arr1[i]) : undefined;
            const v2 = i < arr2.length ? this.normalizeForCompare(arr2[i]) : undefined;
            if (i >= arr1.length) {
                diffs.push({ type: 'added', path: currentPath, value: v2 });
            } else if (i >= arr2.length) {
                diffs.push({ type: 'deleted', path: currentPath, value: v1 });
            } else if (!this.deepEqual(v1, v2)) {
                if (v1 !== null && v2 !== null) {
                    if (Array.isArray(v1) && Array.isArray(v2)) {
                        diffs.push(...this.compareArrays(v1, v2, currentPath));
                        continue;
                    }
                    if (typeof v1 === 'object' && typeof v2 === 'object') {
                        diffs.push(...this.compareObjects(v1, v2, currentPath));
                        continue;
                    }
                }
                diffs.push({ type: 'changed', path: currentPath, oldValue: v1, newValue: v2 });
            }
        }
        return diffs;
    }

    // 规范化用于比较的值：尝试解析字符串里的JSON，并保持BigInt
    normalizeForCompare(value) {
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                try {
                    return this.parseJSONWithBigInt(trimmed);
                } catch (_) { /* 保持原始字符串 */ }
            }
        }
        return value;
    }

    /**
     * 深度比较两个值，支持BigInt
     * @param {*} a - 第一个值
     * @param {*} b - 第二个值
     * @returns {boolean} 是否相等
     */
    deepEqual(a, b) {
        if (a === b) return true;
        
        // 处理BigInt/long 的宽松等值（与数字或数字字符串比较）
        if (typeof a === 'bigint' || typeof b === 'bigint') {
            const toBigIntOrNull = (v) => {
                if (typeof v === 'bigint') return v;
                if (typeof v === 'number' && Number.isInteger(v)) {
                    try { return BigInt(v); } catch { return null; }
                }
                if (typeof v === 'string' && /^-?\d+$/.test(v)) {
                    try { return BigInt(v); } catch { return null; }
                }
                return null;
            };
            const ba = toBigIntOrNull(a);
            const bb = toBigIntOrNull(b);
            if (ba !== null && bb !== null) {
                return ba === bb;
            }
            return false;
        }
        
        // 处理null和undefined
        if (a == null || b == null) {
            return a === b;
        }
        
        // 处理数组
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }
        
        // 处理对象
        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            
            if (keysA.length !== keysB.length) return false;
            
            for (let key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
        
        return false;
    }

    /**
     * 字符串化值，支持BigInt
     * @param {*} value - 要字符串化的值
     * @returns {string} 字符串表示
     */
    stringifyValue(value) {
        const type = typeof value;
        if (type === 'bigint') return value.toString();
        if (value === null) return 'null';
        if (type === 'string') return JSON.stringify(value);
        if (type === 'number' || type === 'boolean') return JSON.stringify(value);
        // 对象或数组，使用支持 BigInt 的 stringify
        try {
            return this.stringifyJSONWithBigInt(value, null, 0);
        } catch (e) {
            // 兜底：转成字符串
            try { return String(value); } catch { return '[Unserializable]'; }
        }
    }

    // 格式化差异结果
    formatDifferences(differences) {
        if (differences.length === 0) {
            return '<div class="success">两个JSON数据完全相同</div>';
        }
        
        return `<div class="differences">
            <h4>发现 ${differences.length} 处差异:</h4>
            ${differences.map(diff => {
                switch (diff.type) {
                    case 'added':
                        return `<div class="diff-item added">+ 新增: ${diff.path} = ${this.stringifyValue(diff.value)}</div>`;
                    case 'deleted':
                        return `<div class="diff-item deleted">- 删除: ${diff.path} = ${this.stringifyValue(diff.value)}</div>`;
                    case 'changed':
                        return `<div class="diff-item changed">~ 修改: ${diff.path}<br>  旧值: ${this.stringifyValue(diff.oldValue)}<br>  新值: ${this.stringifyValue(diff.newValue)}</div>`;
                    default:
                        return '';
                }
            }).join('')}
        </div>`;
    }



    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 支持BigInt的JSON解析器，防止大整数精度丢失
     * @param {string} text - JSON字符串
     * @returns {*} 解析后的对象，大整数使用BigInt表示
     */
    parseJSONWithBigInt(text) {
        // 核心问题：JSON.parse在调用reviver之前就已经将大整数转换为number并丢失精度
        // 解决方案：预处理JSON字符串，将可能丢失精度的大整数用引号包围，然后在reviver中转换为BigInt
        
        // 第一步：预处理JSON字符串，识别并保护大整数
        let processedText = this.preprocessLargeIntegers(text);
        
        // 第二步：使用处理过的文本进行解析
        return JSON.parse(processedText, (key, value) => {
            // 处理特殊标记的大整数字符串
            if (typeof value === 'string' && value.startsWith('__BIGINT__')) {
                const numberStr = value.substring(10); // 移除 '__BIGINT__' 前缀
                try {
                    return BigInt(numberStr);
                } catch (e) {
                    console.warn(`无法将 ${numberStr} 转换为BigInt，保持原值`);
                    return numberStr;
                }
            }
            
            // 处理已经是number但超出安全范围的值（备用保护）
            if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) {
                console.warn(`检测到精度已丢失的数字: ${value}, 尝试恢复`);
                try {
                    return BigInt(Math.round(value));
                } catch (e) {
                    return value;
                }
            }
            
            // 检查字符串是否为纯数字且为大整数格式
            if (typeof value === 'string' && /^-?\d{16,}$/.test(value)) {
                // 检查字段名，如果是常见的ID字段名，不转换为BigInt
                const idFieldPatterns = [
                    'id', 'no', 'code', 'num', 'seq', 'bat', 'order', 
                    'trade', 'merchant', 'biz', 'out', 'orig', 'credit',
                    'freeze', 'asset', 'detail', 'account', 'journal'
                ];
                
                const isLikelyId = key && idFieldPatterns.some(pattern => 
                    key.toLowerCase().includes(pattern.toLowerCase())
                );
                
                if (!isLikelyId) {
                    try {
                        const num = BigInt(value);
                        if (value.length >= 16 || !Number.isSafeInteger(Number(value))) {
                            return num;
                        }
                    } catch (e) {
                        // 转换失败，保持原字符串
                    }
                }
            }
            
            return value;
        });
    }

    /**
     * 预处理JSON字符串，将大整数用特殊标记包围以避免精度丢失
     * @param {string} text - 原始JSON字符串
     * @returns {string} 处理后的JSON字符串
     */
    preprocessLargeIntegers(text) {
        // 更安全的方法：识别JSON值位置的大整数
        // 避免复杂的字符串状态解析，使用简单但有效的模式匹配
        
        let result = text;
        
        // 方法1：匹配对象属性值中的大整数
        result = result.replace(/("[\w\-_]+"\s*:\s*)(\d{15,})/g, (match, prefix, numStr) => {
            const num = Number(numStr);
            if (numStr.length >= 16 || !Number.isSafeInteger(num)) {
                return prefix + `"__BIGINT__${numStr}"`;
            }
            return match;
        });
        
        // 方法2：匹配数组中的大整数
        result = result.replace(/([\[\s,]\s*)(\d{15,})(\s*[\s,\]])/g, (match, prefix, numStr, suffix) => {
            const num = Number(numStr);
            if (numStr.length >= 16 || !Number.isSafeInteger(num)) {
                return prefix + `"__BIGINT__${numStr}"` + suffix;
            }
            return match;
        });
        
        // 方法3：处理负数
        result = result.replace(/("[\w\-_]+"\s*:\s*)(-\d{15,})/g, (match, prefix, numStr) => {
            const num = Number(numStr);
            if (numStr.length >= 16 || !Number.isSafeInteger(num)) {
                return prefix + `"__BIGINT__${numStr}"`;
            }
            return match;
        });
        
        result = result.replace(/([\[\s,]\s*)(-\d{15,})(\s*[\s,\]])/g, (match, prefix, numStr, suffix) => {
            const num = Number(numStr);
            if (numStr.length >= 16 || !Number.isSafeInteger(num)) {
                return prefix + `"__BIGINT__${numStr}"` + suffix;
            }
            return match;
        });
        
        return result;
    }



    /**
     * 支持BigInt的JSON字符串化，正确输出大整数
     * @param {*} value - 要字符串化的值
     * @param {function|array} replacer - replacer函数或数组
     * @param {string|number} space - 缩进空格
     * @returns {string} JSON字符串
     */
    stringifyJSONWithBigInt(value, replacer = null, space = 0) {
        return JSON.stringify(value, (key, val) => {
            // 处理BigInt类型
            if (typeof val === 'bigint') {
                return val.toString();
            }
            
            // 如果有自定义replacer，继续使用
            if (typeof replacer === 'function') {
                return replacer(key, val);
            } else if (Array.isArray(replacer) && replacer.includes(key)) {
                return val;
            } else if (replacer === null) {
                return val;
            }
            
            return val;
        }, space);
    }

    /**
     * 检测字符串是否为大整数
     * @param {string} str - 要检测的字符串
     * @returns {boolean} 是否为大整数
     */
    isBigInteger(str) {
        return /^-?\d{16,}$/.test(str) || 
               (typeof str === 'number' && !Number.isSafeInteger(str) && Number.isInteger(str));
    }
} 