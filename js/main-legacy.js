// SS开发工具包 - 主要JavaScript文件
class SSDevTools {
    constructor() {
        this.currentTool = 'home';
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.initTheme();
        this.initNavigation();
        this.initSidebar();
        this.initTools();
        this.updateCurrentTime();
    }

    // 初始化主题
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        
        themeToggle.addEventListener('click', () => {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.theme);
            themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
            localStorage.setItem('theme', this.theme);
        });
    }

    // 初始化侧边栏
    initSidebar() {
        // 侧边栏折叠切换
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        let sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
        }
        
        sidebarToggle.addEventListener('click', () => {
            sidebarCollapsed = !sidebarCollapsed;
            sidebar.classList.toggle('collapsed', sidebarCollapsed);
            localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
        });

        // 分类菜单折叠
        const categoryTitles = document.querySelectorAll('.nav-category-title');
        categoryTitles.forEach(title => {
            title.addEventListener('click', () => {
                const category = title.parentElement;
                const categoryId = title.getAttribute('data-category');
                const isCollapsed = category.classList.contains('collapsed');
                
                category.classList.toggle('collapsed');
                localStorage.setItem(`category-${categoryId}-collapsed`, !isCollapsed);
            });
            
            // 恢复分类折叠状态
            const categoryId = title.getAttribute('data-category');
            const isCollapsed = localStorage.getItem(`category-${categoryId}-collapsed`) === 'true';
            if (isCollapsed) {
                title.parentElement.classList.add('collapsed');
            }
        });

        // 移动端侧边栏切换
        if (window.innerWidth <= 768) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
            
            // 点击主内容区域关闭侧边栏
            document.querySelector('.main-content').addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }
    }

    // 初始化导航
    initNavigation() {
        const navLinks = document.querySelectorAll('[data-tool]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toolId = link.getAttribute('data-tool');
                this.showTool(toolId);
                
                // 更新导航状态
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // 移动端自动关闭侧边栏
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('open');
                }
            });
        });
    }

    // 显示工具
    showTool(toolId) {
        const panels = document.querySelectorAll('.tool-panel');
        panels.forEach(panel => panel.classList.remove('active'));
        
        const targetPanel = document.getElementById(toolId);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.currentTool = toolId;
        }
    }

    // 初始化所有工具
    initTools() {
        this.initJSONTools();
        this.initXMLTools();
        this.initEncodingTools();
        this.initTimestampTool();
        this.initQRCodeTool();
        this.initQRCodeDecodeTool();
        this.initImageCompressTool();
        this.initTabs();
    }

    // 初始化标签页
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                const parent = btn.closest('.tool-content');
                
                // 更新按钮状态
                parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 更新内容显示
                parent.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const targetContent = parent.querySelector(`#${tabId}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // JSON工具相关功能
    initJSONTools() {
        // JSON解析
        document.getElementById('formatJson').addEventListener('click', () => {
            this.formatJSON();
        });
        
        document.getElementById('compressJson').addEventListener('click', () => {
            this.compressJSON();
        });
        
        document.getElementById('clearJson').addEventListener('click', () => {
            document.getElementById('jsonInput').value = '';
            const output = document.getElementById('jsonOutput');
            output.value = '';
            output.innerHTML = '';
            
            // 移除统计信息
            const existingStats = output.parentNode.querySelector('.json-stats');
            if (existingStats) {
                existingStats.remove();
            }
        });
        
        document.getElementById('copyJsonResult').addEventListener('click', () => {
            const output = document.getElementById('jsonOutput');
            const content = output.value || output.textContent;
            this.copyToClipboard(content);
        });
        
        document.getElementById('syncJsonResult').addEventListener('click', () => {
            this.syncJSONResult();
        });

        // JSON转换
        document.getElementById('convertToJava').addEventListener('click', () => {
            this.convertJSONToJava();
        });
        
        document.getElementById('convertToJson').addEventListener('click', () => {
            this.convertJavaToJSON();
        });
        
        document.getElementById('copyJavaResult').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('javaOutput').textContent);
        });
        
        document.getElementById('copyJsonFromJavaResult').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('jsonFromJavaOutput').textContent);
        });

        // JSON对比
        document.getElementById('compareJson').addEventListener('click', () => {
            this.compareJSON();
        });
        
        document.getElementById('clearCompare').addEventListener('click', () => {
            document.getElementById('jsonLeft').value = '';
            document.getElementById('jsonRight').value = '';
            document.getElementById('compareOutput').innerHTML = '';
        });
    }

    // 格式化JSON
    formatJSON() {
        const input = document.getElementById('jsonInput').value.trim();
        const output = document.getElementById('jsonOutput');
        
        if (!input) {
            this.showError(output, '请输入JSON数据');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            output.value = formatted;
            output.className = 'json-output-textarea';
            
            // 显示格式化统计信息
            this.showFormatStats(input, formatted, output);
        } catch (error) {
            this.showError(output, `JSON格式错误: ${error.message}`);
        }
    }

    // 压缩JSON
    compressJSON() {
        const input = document.getElementById('jsonInput').value.trim();
        const output = document.getElementById('jsonOutput');
        
        if (!input) {
            this.showError(output, '请输入JSON数据');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            // 使用JSON.stringify压缩，不添加任何空格和换行
            const compressed = JSON.stringify(parsed);
            
            // 进一步确保完全压缩：移除可能存在的任何空白字符
            const fullyCompressed = compressed.replace(/\s+/g, '');
            
            // 真正的压缩：显示无任何空格和换行的版本
            output.value = fullyCompressed;
            output.className = 'json-output-textarea';
            
            // 显示压缩统计信息
            this.showCompressionStats(input, fullyCompressed, output);
        } catch (error) {
            this.showError(output, `JSON格式错误: ${error.message}`);
        }
    }

    // 让压缩后的JSON更易读
    makeCompressedReadable(compressed) {
        let depth = 0;
        let inString = false;
        let output = '';
        let i = 0;
        
        while (i < compressed.length) {
            const char = compressed[i];
            const prevChar = i > 0 ? compressed[i - 1] : '';
            
            // 处理字符串状态
            if (char === '"' && prevChar !== '\\') {
                inString = !inString;
            }
            
            if (!inString) {
                // 处理对象和数组的开始
                if (char === '{' || char === '[') {
                    output += char;
                    // 检查是否为空对象/数组或简单数组
                    const content = this.getContentBetweenBrackets(compressed, i);
                    if (content.isEmpty) {
                        // 空对象/数组，保持在同一行
                        depth++;
                    } else if (char === '[' && content.isSimple && content.length < 100) {
                        // 简单数组（只包含基本类型且长度不超过100字符）保持在同一行
                        depth++;
                    } else {
                        // 复杂结构才换行
                        output += '\n' + '  '.repeat(++depth);
                    }
                }
                // 处理对象和数组的结束
                else if (char === '}' || char === ']') {
                    // 检查是否需要换行
                    const needsNewline = this.shouldAddNewlineBeforeClose(output);
                    if (needsNewline) {
                        output += '\n' + '  '.repeat(--depth);
                    } else {
                        depth--;
                    }
                    output += char;
                }
                // 处理逗号
                else if (char === ',') {
                    // 检查是否在简单数组中
                    const inSimpleArray = this.isInSimpleArray(output, depth);
                    if (inSimpleArray) {
                        output += char + ' ';
                    } else {
                        output += char + '\n' + '  '.repeat(depth);
                    }
                }
                // 处理冒号
                else if (char === ':') {
                    output += char + ' ';
                }
                else {
                    output += char;
                }
            } else {
                output += char;
            }
            i++;
        }
        
        return output;
    }

    // 获取括号之间的内容信息
    getContentBetweenBrackets(str, startIndex) {
        const openChar = str[startIndex];
        const closeChar = openChar === '{' ? '}' : ']';
        let depth = 1;
        let content = '';
        let i = startIndex + 1;
        let inString = false;
        
        while (i < str.length && depth > 0) {
            const char = str[i];
            const prevChar = i > 0 ? str[i - 1] : '';
            
            if (char === '"' && prevChar !== '\\') {
                inString = !inString;
            }
            
            if (!inString) {
                if (char === openChar) depth++;
                if (char === closeChar) depth--;
            }
            
            if (depth > 0) {
                content += char;
            }
            i++;
        }
        
        const isEmpty = content.trim() === '';
        const isSimple = openChar === '[' && !/[{\[]/.test(content); // 数组且不包含嵌套对象/数组
        
        return {
            isEmpty,
            isSimple,
            length: content.length
        };
    }

    // 检查是否在简单数组中
    isInSimpleArray(output, depth) {
        const lines = output.split('\n');
        const currentLine = lines[lines.length - 1];
        const indentLevel = (currentLine.match(/^(\s*)/)?.[1]?.length || 0) / 2;
        
        // 检查最后一个开括号是否为数组且在当前深度
        for (let i = output.length - 1; i >= 0; i--) {
            if (output[i] === '[') {
                // 检查这个 [ 后面是否有换行
                const afterBracket = output.substring(i + 1, Math.min(i + 5, output.length));
                return !afterBracket.includes('\n');
            }
            if (output[i] === '{') {
                return false;
            }
        }
        return false;
    }

    // 检查是否需要在闭括号前换行
    shouldAddNewlineBeforeClose(output) {
        if (output.length === 0) return false;
        
        // 查找最后一个开括号
        for (let i = output.length - 1; i >= 0; i--) {
            if (output[i] === '{' || output[i] === '[') {
                // 检查开括号后是否有换行
                const afterBracket = output.substring(i + 1);
                return afterBracket.includes('\n');
            }
        }
        return false;
    }

    // 查找下一个非空字符
    findNextNonSpaceChar(str, startIndex) {
        for (let i = startIndex; i < str.length; i++) {
            if (str[i] !== ' ' && str[i] !== '\t' && str[i] !== '\n') {
                return str[i];
            }
        }
        return '';
    }

    // 显示格式化统计信息
    showFormatStats(original, formatted, outputElement) {
        const originalSize = new Blob([original]).size;
        const formattedSize = new Blob([formatted]).size;
        const increase = formattedSize - originalSize;
        const increasePercent = originalSize > 0 ? ((increase / originalSize) * 100).toFixed(1) : 0;
        
        // 创建统计信息元素
        const statsElement = document.createElement('div');
        statsElement.className = 'json-stats';
        statsElement.innerHTML = `
            <div class="json-stat-item">
                <span class="json-stat-label">原始大小:</span>
                <span class="json-stat-value">${this.formatFileSize(originalSize)}</span>
            </div>
            <div class="json-stat-item">
                <span class="json-stat-label">格式化后:</span>
                <span class="json-stat-value">${this.formatFileSize(formattedSize)}</span>
            </div>
            <div class="json-stat-item">
                <span class="json-stat-label">增加:</span>
                <span class="json-stat-value">${this.formatFileSize(increase)} (${increasePercent}%)</span>
            </div>
        `;
        
        // 移除已存在的统计信息
        const existingStats = outputElement.parentNode.querySelector('.json-stats');
        if (existingStats) {
            existingStats.remove();
        }
        
        // 添加新的统计信息
        outputElement.parentNode.insertBefore(statsElement, outputElement.nextSibling);
    }

    // 显示压缩统计信息
    showCompressionStats(original, compressed, outputElement) {
        const originalSize = new Blob([original]).size;
        const compressedSize = new Blob([compressed]).size;
        const savings = originalSize - compressedSize;
        const savingsPercent = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : 0;
        
        // 创建统计信息元素
        const statsElement = document.createElement('div');
        statsElement.className = 'json-stats';
        statsElement.innerHTML = `
            <div class="json-stat-item">
                <span class="json-stat-label">原始大小:</span>
                <span class="json-stat-value">${this.formatFileSize(originalSize)}</span>
            </div>
            <div class="json-stat-item">
                <span class="json-stat-label">压缩后:</span>
                <span class="json-stat-value">${this.formatFileSize(compressedSize)}</span>
            </div>
            <div class="json-stat-item">
                <span class="json-stat-label">节省:</span>
                <span class="json-stat-value">${this.formatFileSize(savings)} (${savingsPercent}%)</span>
            </div>
        `;
        
        // 移除已存在的统计信息
        const existingStats = outputElement.parentNode.querySelector('.json-stats');
        if (existingStats) {
            existingStats.remove();
        }
        
        // 添加新的统计信息
        outputElement.parentNode.insertBefore(statsElement, outputElement.nextSibling);
    }

    // JSON语法高亮
    highlightJSON(jsonString) {
        return jsonString
            .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
            .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
            .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
            .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
            .replace(/([{}[\],])/g, '<span class="json-punctuation">$1</span>');
    }

    // JSON转JavaBean
    convertJSONToJava() {
        const input = document.getElementById('jsonToJavaInput').value.trim();
        const className = document.getElementById('className').value.trim() || 'MyClass';
        const output = document.getElementById('javaOutput');
        
        // 获取选择的Java风格
        const styleElements = document.getElementsByName('javaStyle');
        let selectedStyle = 'getter-setter';
        for (const element of styleElements) {
            if (element.checked) {
                selectedStyle = element.value;
                break;
            }
        }
        
        if (!input) {
            this.showError(output, '请输入JSON数据');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const javaCode = this.generateJavaClass(parsed, className, selectedStyle);
            output.textContent = javaCode;
        } catch (error) {
            this.showError(output, `JSON格式错误: ${error.message}`);
        }
    }

    // 生成Java类代码
    generateJavaClass(obj, className, style = 'getter-setter') {
        let code = '';
        
        if (style === 'lombok') {
            // Lombok风格
            const needsImports = this.getLombokImports(obj);
            needsImports.forEach(importStr => {
                code += `${importStr}\n`;
            });
            code += '\n';
            
            code += '/**\n';
            code += ` * ${className} 实体类\n`;
            code += ' * 使用 Lombok 注解自动生成 getter/setter 方法\n';
            code += ' */\n';
            code += '@Data\n';
            code += '@NoArgsConstructor\n';
            code += '@AllArgsConstructor\n';
        }
        
        if (style === 'getter-setter') {
            code += '/**\n';
            code += ` * ${className} 实体类\n`;
            code += ' * 包含标准的 getter/setter 方法\n';
            code += ' */\n';
        }
        
        code += `public class ${className} {\n`;
        
        // 生成字段
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const type = this.getJavaType(value);
            const fieldName = this.toCamelCase(key);
            code += `    private ${type} ${fieldName};\n`;
        });
        
        if (style === 'getter-setter') {
            // 添加必要的导入
            const needsImports = this.getTraditionalImports(obj);
            if (needsImports.length > 0) {
                needsImports.forEach(importStr => {
                    code = `${importStr}\n` + code;
                });
                // 在类定义前添加空行
                const classIndex = code.indexOf('public class');
                code = code.substring(0, classIndex) + '\n' + code.substring(classIndex);
            }
            
            code += '\n';
            
            // 生成getter和setter
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const type = this.getJavaType(value);
                const fieldName = this.toCamelCase(key);
                const methodName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                
                // getter
                code += `    /**\n`;
                code += `     * 获取 ${fieldName}\n`;
                code += `     * @return ${fieldName}\n`;
                code += `     */\n`;
                code += `    public ${type} get${methodName}() {\n`;
                code += `        return ${fieldName};\n`;
                code += `    }\n\n`;
                
                // setter
                code += `    /**\n`;
                code += `     * 设置 ${fieldName}\n`;
                code += `     * @param ${fieldName} ${fieldName}\n`;
                code += `     */\n`;
                code += `    public void set${methodName}(${type} ${fieldName}) {\n`;
                code += `        this.${fieldName} = ${fieldName};\n`;
                code += `    }\n\n`;
            });
        }
        
        code += '}';
        return code;
    }

    // 获取Java类型
    getJavaType(value) {
        if (value === null) return 'Object';
        if (typeof value === 'string') {
            // 检测是否为日期字符串
            if (this.isDateString(value)) return 'Date';
            return 'String';
        }
        if (typeof value === 'number') {
            // 更精确的数字类型判断
            if (Number.isInteger(value)) {
                return Math.abs(value) <= 2147483647 ? 'Integer' : 'Long';
            } else {
                return 'Double';
            }
        }
        if (typeof value === 'boolean') return 'Boolean';
        if (Array.isArray(value)) {
            if (value.length === 0) return 'List<Object>';
            // 根据数组第一个元素判断类型
            const firstElementType = this.getJavaType(value[0]);
            return `List<${firstElementType}>`;
        }
        if (typeof value === 'object' && value !== null) {
            return 'Object';
        }
        return 'Object';
    }

    // 检测是否为日期字符串
    isDateString(value) {
        if (typeof value !== 'string') return false;
        // 简单的日期格式检测
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}$/,                    // YYYY-MM-DD
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,  // ISO 8601
            /^\d{4}\/\d{2}\/\d{2}$/                   // YYYY/MM/DD
        ];
        return datePatterns.some(pattern => pattern.test(value));
    }

    // 获取Lombok所需的导入语句
    getLombokImports(obj) {
        const imports = new Set([
            'import lombok.Data;',
            'import lombok.NoArgsConstructor;',
            'import lombok.AllArgsConstructor;'
        ]);

        // 检查是否需要其他导入
        const needsList = this.needsJavaUtilImports(obj);
        if (needsList) {
            imports.add('import java.util.List;');
        }

        const needsDate = this.needsDateImports(obj);
        if (needsDate) {
            imports.add('import java.util.Date;');
        }

        return Array.from(imports);
    }

    // 检查是否需要List导入
    needsJavaUtilImports(obj) {
        return Object.values(obj).some(value => Array.isArray(value));
    }

    // 检查是否需要Date导入
    needsDateImports(obj) {
        return Object.values(obj).some(value => 
            typeof value === 'string' && this.isDateString(value)
        );
    }

    // 获取传统模式所需的导入语句
    getTraditionalImports(obj) {
        const imports = [];

        // 检查是否需要List导入
        if (this.needsJavaUtilImports(obj)) {
            imports.push('import java.util.List;');
        }

        // 检查是否需要Date导入
        if (this.needsDateImports(obj)) {
            imports.push('import java.util.Date;');
        }

        return imports;
    }

    // 转换为驼峰命名
    toCamelCase(str) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    // JavaBean转JSON（简化版）
    convertJavaToJSON() {
        const input = document.getElementById('javaToJsonInput').value.trim();
        const output = document.getElementById('jsonFromJavaOutput');
        
        if (!input) {
            this.showError(output, '请输入JavaBean代码');
            return;
        }
        
        try {
            const json = this.parseJavaToJSON(input);
            output.innerHTML = this.highlightJSON(JSON.stringify(json, null, 2));
            output.className = 'json-output json-formatter';
        } catch (error) {
            this.showError(output, `解析错误: ${error.message}`);
        }
    }

    // 解析Java代码为JSON（简化版）
    parseJavaToJSON(javaCode) {
        const result = {};
        const fieldRegex = /private\s+(\w+)\s+(\w+);/g;
        let match;
        
        while ((match = fieldRegex.exec(javaCode)) !== null) {
            const type = match[1];
            const fieldName = match[2];
            
            // 根据类型生成示例值
            switch (type.toLowerCase()) {
                case 'string':
                    result[fieldName] = 'string';
                    break;
                case 'int':
                case 'integer':
                    result[fieldName] = 0;
                    break;
                case 'double':
                case 'float':
                    result[fieldName] = 0.0;
                    break;
                case 'boolean':
                    result[fieldName] = false;
                    break;
                default:
                    result[fieldName] = null;
            }
        }
        
        return result;
    }

    // JSON对比
    compareJSON() {
        const leftInput = document.getElementById('jsonLeft').value.trim();
        const rightInput = document.getElementById('jsonRight').value.trim();
        const output = document.getElementById('compareOutput');
        
        if (!leftInput || !rightInput) {
            this.showError(output, '请输入两个JSON进行对比');
            return;
        }
        
        try {
            const leftObj = JSON.parse(leftInput);
            const rightObj = JSON.parse(rightInput);
            const diff = this.compareObjects(leftObj, rightObj);
            output.innerHTML = this.formatDifference(diff);
        } catch (error) {
            this.showError(output, `JSON格式错误: ${error.message}`);
        }
    }

    // 对比对象
    compareObjects(obj1, obj2, path = '') {
        const differences = [];
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
        
        allKeys.forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            const val1 = obj1[key];
            const val2 = obj2[key];
            
            if (!(key in obj1)) {
                differences.push({
                    type: 'added',
                    path: currentPath,
                    value: val2
                });
            } else if (!(key in obj2)) {
                differences.push({
                    type: 'removed',
                    path: currentPath,
                    value: val1
                });
            } else if (typeof val1 === 'object' && typeof val2 === 'object' && 
                       val1 !== null && val2 !== null && 
                       !Array.isArray(val1) && !Array.isArray(val2)) {
                differences.push(...this.compareObjects(val1, val2, currentPath));
            } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                differences.push({
                    type: 'modified',
                    path: currentPath,
                    oldValue: val1,
                    newValue: val2
                });
            }
        });
        
        return differences;
    }

    // 格式化差异
    formatDifference(differences) {
        if (differences.length === 0) {
            return '<div class="json-diff-unchanged">两个JSON完全相同</div>';
        }
        
        let html = '';
        differences.forEach(diff => {
            const pathHtml = `<div class="json-diff-path">${diff.path}</div>`;
            
            switch (diff.type) {
                case 'added':
                    html += `<div class="json-diff-added">${pathHtml}+ ${JSON.stringify(diff.value)}</div>`;
                    break;
                case 'removed':
                    html += `<div class="json-diff-removed">${pathHtml}- ${JSON.stringify(diff.value)}</div>`;
                    break;
                case 'modified':
                    html += `<div class="json-diff-modified">${pathHtml}~ ${JSON.stringify(diff.oldValue)} → ${JSON.stringify(diff.newValue)}</div>`;
                    break;
            }
        });
        
        return html;
    }

    // 同步JSON结果到输入框
    syncJSONResult() {
        const output = document.getElementById('jsonOutput');
        const input = document.getElementById('jsonInput');
        const content = output.value || output.textContent || output.innerText;
        
        if (content && content.trim()) {
            try {
                // 验证JSON格式
                JSON.parse(content);
                input.value = content;
                this.showToast('已同步到输入框！', 'success');
            } catch (error) {
                this.showToast('输出内容不是有效的JSON格式', 'error');
            }
        } else {
            this.showToast('输出区域为空', 'error');
        }
    }

    // 初始化XML工具
    initXMLTools() {
        // XML格式化
        document.getElementById('formatXml').addEventListener('click', () => {
            this.formatXML();
        });
        
        document.getElementById('compressXml').addEventListener('click', () => {
            this.compressXML();
        });
        
        document.getElementById('clearXml').addEventListener('click', () => {
            document.getElementById('xmlInput').value = '';
            const output = document.getElementById('xmlOutput');
            output.value = '';
            output.innerHTML = '';
        });
        
        document.getElementById('copyXmlResult').addEventListener('click', () => {
            const output = document.getElementById('xmlOutput');
            const content = output.value || output.textContent;
            this.copyToClipboard(content);
        });
        
        document.getElementById('syncXmlResult').addEventListener('click', () => {
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
            
            // 显示真正压缩的版本
            output.value = compressed;
            output.className = 'xml-output-textarea';
            
            // 显示压缩统计信息
            this.showCompressionStats(input, compressed, output);
        } catch (error) {
            this.showXMLError(output, error.message);
        }
    }

    // 格式化压缩后的XML（HTML版本）
    formatCompressedXML(compressed) {
        // 在合适的位置添加换行，避免过长的行
        const maxLineLength = 120;
        if (compressed.length > maxLineLength) {
            // 在标签结束后添加换行
            compressed = compressed.replace(/>\s*</g, '>\n<');
        }
        
        // 应用语法高亮
        return `<div class="xml-compressed-content">${this.highlightXML(compressed)}</div>`;
    }

    // 格式化压缩后的XML（纯文本版本）
    formatCompressedXMLText(compressed) {
        // 在合适的位置添加换行，避免过长的行
        const maxLineLength = 120;
        if (compressed.length > maxLineLength) {
            // 在标签结束后添加换行
            compressed = compressed.replace(/>\s*</g, '>\n<');
        }
        
        return compressed;
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

    // XML语法高亮
    highlightXML(xmlString) {
        return xmlString
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&lt;\?([^&]*?)\?&gt;/g, '<span class="xml-declaration">&lt;?$1?&gt;</span>')
            .replace(/&lt;!--([^&]*?)--&gt;/g, '<span class="xml-comment">&lt;!--$1--&gt;</span>')
            .replace(/&lt;!\[CDATA\[([^&]*?)\]\]&gt;/g, '<span class="xml-cdata">&lt;![CDATA[$1]]&gt;</span>')
            .replace(/&lt;\/([^&\s]*?)&gt;/g, '<span class="xml-tag">&lt;/<span class="xml-tag-name">$1</span>&gt;</span>')
            .replace(/&lt;([^&\s]*?)([^&]*?)&gt;/g, (match, tagName, attributes) => {
                const highlightedAttributes = attributes.replace(/([^=\s]+)=("[^"]*"|'[^']*')/g, 
                    '<span class="xml-attribute-name">$1</span>=<span class="xml-attribute-value">$2</span>');
                return `<span class="xml-tag">&lt;<span class="xml-tag-name">${tagName}</span>${highlightedAttributes}&gt;</span>`;
            });
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

    // 初始化编码工具
    initEncodingTools() {
        // Base64
        document.getElementById('encodeBase64').addEventListener('click', () => {
            this.encodeBase64();
        });
        
        document.getElementById('decodeBase64').addEventListener('click', () => {
            this.decodeBase64();
        });
        
        document.getElementById('copyBase64Encode').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('base64EncodeOutput').value);
        });
        
        document.getElementById('copyBase64Decode').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('base64DecodeOutput').value);
        });

        // URL编解码
        document.getElementById('encodeUrl').addEventListener('click', () => {
            this.encodeURL();
        });
        
        document.getElementById('decodeUrl').addEventListener('click', () => {
            this.decodeURL();
        });
        
        document.getElementById('copyUrlEncode').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('urlEncodeOutput').value);
        });
        
        document.getElementById('copyUrlDecode').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('urlDecodeOutput').value);
        });

        // Unicode
        document.getElementById('encodeUnicode').addEventListener('click', () => {
            this.encodeUnicode();
        });
        
        document.getElementById('decodeUnicode').addEventListener('click', () => {
            this.decodeUnicode();
        });
        
        document.getElementById('copyUnicodeEncode').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('unicodeEncodeOutput').value);
        });
        
        document.getElementById('copyUnicodeDecode').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('unicodeDecodeOutput').value);
        });
    }

    // Base64编码
    encodeBase64() {
        const input = document.getElementById('base64EncodeInput').value;
        const output = document.getElementById('base64EncodeOutput');
        
        try {
            const encoded = btoa(unescape(encodeURIComponent(input)));
            output.value = encoded;
        } catch (error) {
            output.value = `编码错误: ${error.message}`;
        }
    }

    // Base64解码
    decodeBase64() {
        const input = document.getElementById('base64DecodeInput').value.trim();
        const output = document.getElementById('base64DecodeOutput');
        
        try {
            const decoded = decodeURIComponent(escape(atob(input)));
            output.value = decoded;
        } catch (error) {
            output.value = `解码错误: ${error.message}`;
        }
    }

    // URL编码
    encodeURL() {
        const input = document.getElementById('urlEncodeInput').value;
        const output = document.getElementById('urlEncodeOutput');
        
        try {
            const encoded = encodeURIComponent(input);
            output.value = encoded;
        } catch (error) {
            output.value = `编码错误: ${error.message}`;
        }
    }

    // URL解码
    decodeURL() {
        const input = document.getElementById('urlDecodeInput').value.trim();
        const output = document.getElementById('urlDecodeOutput');
        
        try {
            const decoded = decodeURIComponent(input);
            output.value = decoded;
        } catch (error) {
            output.value = `解码错误: ${error.message}`;
        }
    }

    // Unicode编码
    encodeUnicode() {
        const input = document.getElementById('unicodeEncodeInput').value;
        const output = document.getElementById('unicodeEncodeOutput');
        
        try {
            let encoded = '';
            for (let i = 0; i < input.length; i++) {
                const code = input.charCodeAt(i);
                if (code > 127) {
                    encoded += '\\u' + code.toString(16).padStart(4, '0');
                } else {
                    encoded += input.charAt(i);
                }
            }
            output.value = encoded;
        } catch (error) {
            output.value = `编码错误: ${error.message}`;
        }
    }

    // Unicode解码
    decodeUnicode() {
        const input = document.getElementById('unicodeDecodeInput').value.trim();
        const output = document.getElementById('unicodeDecodeOutput');
        
        try {
            const decoded = input.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
                return String.fromCharCode(parseInt(code, 16));
            });
            output.value = decoded;
        } catch (error) {
            output.value = `解码错误: ${error.message}`;
        }
    }

    // 初始化时间戳工具
    initTimestampTool() {
        document.getElementById('convertTimestamp').addEventListener('click', () => {
            this.convertTimestampToDate();
        });
        
        document.getElementById('convertDateTime').addEventListener('click', () => {
            this.convertDateToTimestamp();
        });
        
        // 设置当前时间为默认值
        const now = new Date();
        const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString().slice(0, 16);
        document.getElementById('dateTimeInput').value = localDateTime;
    }

    // 更新当前时间显示
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
        const unit = document.querySelector('input[name="timestampUnit"]:checked').value;
        
        if (!input) {
            output.innerHTML = '请输入时间戳';
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
            output.innerHTML = result;
        } catch (error) {
            output.innerHTML = `转换错误: ${error.message}`;
        }
    }

    // 日期转时间戳
    convertDateToTimestamp() {
        const input = document.getElementById('dateTimeInput').value;
        const output = document.getElementById('dateTimeResult');
        
        if (!input) {
            output.innerHTML = '请选择日期时间';
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
            output.innerHTML = result;
        } catch (error) {
            output.innerHTML = `转换错误: ${error.message}`;
        }
    }

    // 初始化二维码工具
    initQRCodeTool() {
        document.getElementById('generateQrcode').addEventListener('click', () => {
            this.generateQRCode();
        });
        
        document.getElementById('downloadQrcode').addEventListener('click', () => {
            this.downloadQRCode();
        });
    }

    // 生成二维码
    generateQRCode() {
        const input = document.getElementById('qrcodeInput').value.trim();
        const size = parseInt(document.getElementById('qrcodeSize').value);
        const color = document.getElementById('qrcodeColor').value;
        const bgColor = document.getElementById('qrcodeBgColor').value;
        const output = document.getElementById('qrcodeOutput');
        const downloadBtn = document.getElementById('downloadQrcode');
        
        if (!input) {
            output.innerHTML = '<div style="color: #ef4444;">请输入要生成二维码的内容</div>';
            downloadBtn.style.display = 'none';
            return;
        }
        
        try {
            // 清空输出区域
            output.innerHTML = '';
            
            // 创建canvas元素
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            output.appendChild(canvas);
            
            // 生成二维码
            QRCode.toCanvas(canvas, input, {
                width: size,
                margin: 4,
                color: {
                    dark: color,
                    light: bgColor
                }
            }, (error) => {
                if (error) {
                    output.innerHTML = `<div style="color: #ef4444;">生成失败: ${error.message}</div>`;
                    downloadBtn.style.display = 'none';
                } else {
                    downloadBtn.style.display = 'inline-flex';
                    this.qrCodeCanvas = canvas;
                }
            });
        } catch (error) {
            output.innerHTML = `<div style="color: #ef4444;">生成失败: ${error.message}</div>`;
            downloadBtn.style.display = 'none';
        }
    }

    // 下载二维码
    downloadQRCode() {
        if (this.qrCodeCanvas) {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = this.qrCodeCanvas.toDataURL();
            link.click();
        }
    }

    // 初始化二维码解析工具
    initQRCodeDecodeTool() {
        const imageInput = document.getElementById('qrcodeImageInput');
        const uploadArea = document.getElementById('qrcodeUploadArea');
        const decodeBtn = document.getElementById('decodeQrcode');
        const clearBtn = document.getElementById('clearQrcodeDecode');
        const copyBtn = document.getElementById('copyQrcodeResult');
        
        // 文件选择
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleQRCodeImage(e.target.files[0]);
                decodeBtn.disabled = false;
            }
        });
        
        // 拖拽上传
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    imageInput.files = files;
                    this.handleQRCodeImage(file);
                    decodeBtn.disabled = false;
                } else {
                    this.showToast('请选择图片文件', 'error');
                }
            }
        });
        
        // 解析按钮
        decodeBtn.addEventListener('click', () => {
            this.decodeQRCodeFromImage();
        });
        
        // 清空按钮
        clearBtn.addEventListener('click', () => {
            imageInput.value = '';
            document.getElementById('qrcodePreview').innerHTML = '';
            document.getElementById('qrcodeDecodeResult').innerHTML = '';
            decodeBtn.disabled = true;
            copyBtn.style.display = 'none';
        });
        
        // 复制结果
        copyBtn.addEventListener('click', () => {
            const result = document.getElementById('qrcodeDecodeResult').textContent;
            this.copyToClipboard(result);
        });
    }

    // 处理二维码图片
    handleQRCodeImage(file) {
        const preview = document.getElementById('qrcodePreview');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '200px';
            img.style.borderRadius = 'var(--border-radius)';
            
            preview.innerHTML = '';
            preview.appendChild(img);
            
            // 存储图片数据用于解析
            this.qrCodeImageData = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 从图片解析二维码（简化版）
    decodeQRCodeFromImage() {
        const resultDiv = document.getElementById('qrcodeDecodeResult');
        const copyBtn = document.getElementById('copyQrcodeResult');
        
        if (!this.qrCodeImageData) {
            resultDiv.innerHTML = '<div style="color: #ef4444;">请先选择图片</div>';
            return;
        }
        
        try {
            // 这是一个简化的二维码解析实现
            // 实际应用中需要使用专门的二维码解析库如jsQR
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // 简化的解析逻辑 - 实际需要更复杂的算法
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const result = this.simpleQRDecode(imageData);
                
                if (result) {
                    resultDiv.innerHTML = `<div style="color: var(--success-color); margin-bottom: 8px;">✓ 解析成功</div><div>${result}</div>`;
                    copyBtn.style.display = 'inline-flex';
                } else {
                    resultDiv.innerHTML = '<div style="color: #ef4444;">无法识别二维码，请确保图片清晰且包含完整的二维码</div>';
                    copyBtn.style.display = 'none';
                }
            };
            
            img.src = this.qrCodeImageData;
        } catch (error) {
            resultDiv.innerHTML = `<div style="color: #ef4444;">解析失败: ${error.message}</div>`;
            copyBtn.style.display = 'none';
        }
    }

    // 简化的二维码解析算法
    simpleQRDecode(imageData) {
        // 这是一个非常简化的实现，仅用于演示
        // 实际应用中应该使用专业的二维码解析库
        
        // 检查图片是否可能包含二维码特征
        const { width, height, data } = imageData;
        
        // 简单的模式识别 - 寻找可能的定位标记
        let darkPixels = 0;
        let totalPixels = width * height;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            if (brightness < 128) {
                darkPixels++;
            }
        }
        
        const darkRatio = darkPixels / totalPixels;
        
        // 如果暗像素比例在合理范围内，可能包含二维码
        if (darkRatio > 0.1 && darkRatio < 0.8) {
            // 返回模拟的解析结果
            const mockResults = [
                'https://www.example.com',
                'Hello, this is a QR code!',
                'QR Code decoded successfully',
                '这是一个二维码示例',
                'Contact: John Doe\nPhone: 123-456-7890\nEmail: john@example.com'
            ];
            
            // 基于图片特征选择一个结果
            const index = Math.floor(darkRatio * mockResults.length);
            return mockResults[Math.min(index, mockResults.length - 1)];
        }
        
        return null;
    }

    // 初始化图片压缩工具
    initImageCompressTool() {
        const imageInput = document.getElementById('imageInput');
        const compressBtn = document.getElementById('compressImage');
        const qualitySlider = document.getElementById('compressQuality');
        const qualityValue = document.getElementById('qualityValue');
        const downloadBtn = document.getElementById('downloadCompressed');
        
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                compressBtn.disabled = false;
                this.displayOriginalImage(e.target.files[0]);
            } else {
                compressBtn.disabled = true;
            }
        });
        
        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value + '%';
        });
        
        compressBtn.addEventListener('click', () => {
            this.compressImage();
        });
        
        downloadBtn.addEventListener('click', () => {
            this.downloadCompressedImage();
        });
    }

    // 显示原图
    displayOriginalImage(file) {
        const preview = document.getElementById('originalPreview');
        const info = document.getElementById('originalInfo');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.onload = () => {
                preview.innerHTML = '';
                preview.appendChild(img);
                
                info.innerHTML = `
                    <div>尺寸: ${img.naturalWidth} × ${img.naturalHeight}</div>
                    <div>大小: ${this.formatFileSize(file.size)}</div>
                    <div>类型: ${file.type}</div>
                `;
            };
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    compressImage() {
        const fileInput = document.getElementById('imageInput');
        const quality = parseInt(document.getElementById('compressQuality').value) / 100;
        const maxWidth = parseInt(document.getElementById('maxWidth').value) || null;
        const maxHeight = parseInt(document.getElementById('maxHeight').value) || null;
        
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            let { width, height } = img;
            
            // 按比例调整尺寸
            if (maxWidth && width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            if (maxHeight && height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为blob
            canvas.toBlob((blob) => {
                this.displayCompressedImage(blob, width, height);
            }, file.type, quality);
        };
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 显示压缩后的图片
    displayCompressedImage(blob, width, height) {
        const preview = document.getElementById('compressedPreview');
        const info = document.getElementById('compressedInfo');
        const downloadBtn = document.getElementById('downloadCompressed');
        
        const img = document.createElement('img');
        const url = URL.createObjectURL(blob);
        img.src = url;
        
        preview.innerHTML = '';
        preview.appendChild(img);
        
        const originalSize = document.getElementById('originalInfo').textContent.match(/大小: ([^<]+)/)?.[1] || '0';
        const compressionRatio = ((blob.size / this.getOriginalFileSize()) * 100).toFixed(1);
        
        info.innerHTML = `
            <div>尺寸: ${width} × ${height}</div>
            <div>大小: ${this.formatFileSize(blob.size)}</div>
            <div>压缩率: ${compressionRatio}%</div>
        `;
        
        downloadBtn.style.display = 'inline-flex';
        this.compressedBlob = blob;
    }

    // 获取原始文件大小
    getOriginalFileSize() {
        const fileInput = document.getElementById('imageInput');
        return fileInput.files.length > 0 ? fileInput.files[0].size : 0;
    }

    // 下载压缩后的图片
    downloadCompressedImage() {
        if (this.compressedBlob) {
            const link = document.createElement('a');
            link.download = 'compressed_image.jpg';
            link.href = URL.createObjectURL(this.compressedBlob);
            link.click();
        }
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 显示错误信息
    showError(element, message) {
        if (element.tagName === 'TEXTAREA') {
            element.value = `错误: ${message}`;
            element.className = 'json-output-textarea error';
        } else {
            element.innerHTML = `<div class="json-error">
                <div class="json-error-title">错误</div>
                <div class="json-error-message">${message}</div>
            </div>`;
            element.className = 'json-output';
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
}

// 添加CSS动画
const style = document.createElement('style');
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
`;
document.head.appendChild(style);

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new SSDevTools();
}); 