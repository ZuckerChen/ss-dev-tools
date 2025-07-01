/**
 * JSON工具类 - 处理JSON解析、格式化、压缩、转换、对比
 */
class JSONTool extends BaseTool {
    constructor() {
        super();
        this.name = 'JSON工具';
    }

    init() {
        this.initJSONParser();
        this.initJSONConverter();
        this.initJSONComparator();
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
            this.copyJSONResult();
        });
        
        document.getElementById('syncJsonResult')?.addEventListener('click', () => {
            this.syncJSONResult();
        });
    }

    // 初始化JSON转换工具
    initJSONConverter() {
        document.getElementById('convertToJava')?.addEventListener('click', () => {
            this.convertJSONToJava();
        });
        
        document.getElementById('convertToJson')?.addEventListener('click', () => {
            this.convertJavaToJSON();
        });
        
        document.getElementById('copyJavaResult')?.addEventListener('click', () => {
            const content = document.getElementById('javaOutput').textContent;
            this.copyToClipboard(content);
        });
        
        document.getElementById('copyJsonFromJavaResult')?.addEventListener('click', () => {
            const content = document.getElementById('jsonFromJavaOutput').textContent;
            this.copyToClipboard(content);
        });
    }

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
            this.showStats(input, formatted, output, 'format');
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
            const compressed = JSON.stringify(parsed).replace(/\s+/g, '');
            
            output.value = compressed;
            output.className = 'json-output-textarea';
            
            // 显示压缩统计信息
            this.showStats(input, compressed, output, 'compression');
        } catch (error) {
            this.showError(output, `JSON格式错误: ${error.message}`);
        }
    }

    // 清空JSON
    clearJSON() {
        document.getElementById('jsonInput').value = '';
        const output = document.getElementById('jsonOutput');
        output.value = '';
        output.innerHTML = '';
        
        // 移除统计信息
        const existingStats = output.parentNode.querySelector('.stats-container');
        if (existingStats) {
            existingStats.remove();
        }
    }

    // 复制JSON结果
    copyJSONResult() {
        const output = document.getElementById('jsonOutput');
        const content = output.value || output.textContent;
        this.copyToClipboard(content);
    }

    // 同步JSON结果到输入框
    syncJSONResult() {
        const output = document.getElementById('jsonOutput');
        const input = document.getElementById('jsonInput');
        const content = output.value || output.textContent || output.innerText;
        
        if (content && content.trim()) {
            try {
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

    // JSON转JavaBean
    convertJSONToJava() {
        const input = document.getElementById('jsonToJavaInput').value.trim();
        const output = document.getElementById('javaOutput');
        const className = document.getElementById('className').value.trim() || 'MyClass';
        const style = document.querySelector('input[name="javaStyle"]:checked').value;
        
        if (!input) {
            output.textContent = '请输入JSON数据';
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const javaCode = this.generateJavaClass(parsed, className, style);
            output.textContent = javaCode;
        } catch (error) {
            output.textContent = `JSON格式错误: ${error.message}`;
        }
    }

    // 生成Java类代码
    generateJavaClass(obj, className, style = 'getter-setter') {
        const imports = this.getImports(obj, style);
        const fields = this.generateFields(obj);
        const methods = style === 'lombok' ? this.generateLombokMethods() : this.generateTraditionalMethods(obj, className);
        
        return `${imports}

${style === 'lombok' ? this.generateLombokAnnotations() : ''}/**
 * ${className}类
 * 自动生成的JavaBean类
 */
public class ${className} {
${fields}
${methods}
}`;
    }

    // 获取导入语句
    getImports(obj, style) {
        const imports = new Set();
        
        if (style === 'lombok') {
            imports.add('import lombok.Data;');
            imports.add('import lombok.NoArgsConstructor;');
            imports.add('import lombok.AllArgsConstructor;');
        }
        
        if (this.needsDateImports(obj)) {
            imports.add('import java.util.Date;');
        }
        
        if (this.needsListImports(obj)) {
            imports.add('import java.util.List;');
        }
        
        return Array.from(imports).join('\n');
    }

    // 生成字段
    generateFields(obj) {
        return Object.entries(obj).map(([key, value]) => {
            const javaType = this.getJavaType(value);
            const fieldName = this.toCamelCase(key);
            return `    /** ${key} */\n    private ${javaType} ${fieldName};`;
        }).join('\n\n');
    }

    // 生成Lombok注解
    generateLombokAnnotations() {
        return `@Data
@NoArgsConstructor
@AllArgsConstructor
`;
    }

    // 生成Lombok方法（构造函数等）
    generateLombokMethods() {
        return `    // 使用Lombok自动生成getter、setter、equals、hashCode、toString方法`;
    }

    // 生成传统方法
    generateTraditionalMethods(obj, className) {
        const getters = this.generateGetters(obj);
        const setters = this.generateSetters(obj);
        const constructor = this.generateConstructor(obj, className);
        
        return `${constructor}

${getters}

${setters}`;
    }

    // 生成getter方法
    generateGetters(obj) {
        return Object.entries(obj).map(([key, value]) => {
            const javaType = this.getJavaType(value);
            const fieldName = this.toCamelCase(key);
            const methodName = `get${this.capitalize(fieldName)}`;
            
            return `    /**
     * 获取${key}
     * @return ${key}
     */
    public ${javaType} ${methodName}() {
        return ${fieldName};
    }`;
        }).join('\n\n');
    }

    // 生成setter方法
    generateSetters(obj) {
        return Object.entries(obj).map(([key, value]) => {
            const javaType = this.getJavaType(value);
            const fieldName = this.toCamelCase(key);
            const methodName = `set${this.capitalize(fieldName)}`;
            
            return `    /**
     * 设置${key}
     * @param ${fieldName} ${key}
     */
    public void ${methodName}(${javaType} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }`;
        }).join('\n\n');
    }

    // 生成构造函数
    generateConstructor(obj, className) {
        return `    /**
     * 无参构造函数
     */
    public ${className}() {
    }`;
    }

    // 获取Java类型
    getJavaType(value) {
        if (value === null) return 'Object';
        if (typeof value === 'string') {
            if (this.isDateString(value)) return 'Date';
            return 'String';
        }
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'Integer' : 'Double';
        }
        if (typeof value === 'boolean') return 'Boolean';
        if (Array.isArray(value)) {
            if (value.length > 0) {
                const elementType = this.getJavaType(value[0]);
                return `List<${elementType}>`;
            }
            return 'List<Object>';
        }
        if (typeof value === 'object') return 'Object';
        return 'Object';
    }

    // 判断是否为日期字符串
    isDateString(value) {
        if (typeof value !== 'string') return false;
        const date = new Date(value);
        return !isNaN(date.getTime()) && (
            /^\d{4}-\d{2}-\d{2}/.test(value) ||
            /^\d{4}\/\d{2}\/\d{2}/.test(value) ||
            /T\d{2}:\d{2}:\d{2}/.test(value)
        );
    }

    // 检查是否需要Date导入
    needsDateImports(obj) {
        return Object.values(obj).some(value => 
            typeof value === 'string' && this.isDateString(value)
        );
    }

    // 检查是否需要List导入
    needsListImports(obj) {
        return Object.values(obj).some(value => Array.isArray(value));
    }

    // 转换为驼峰命名
    toCamelCase(str) {
        return str.replace(/[_-](.)/g, (_, char) => char.toUpperCase());
    }

    // 首字母大写
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // JavaBean转JSON
    convertJavaToJSON() {
        const input = document.getElementById('javaToJsonInput').value.trim();
        const output = document.getElementById('jsonFromJavaOutput');
        
        if (!input) {
            output.textContent = '请输入JavaBean代码';
            return;
        }
        
        try {
            const jsonData = this.parseJavaToJSON(input);
            const formatted = JSON.stringify(jsonData, null, 2);
            output.textContent = formatted;
        } catch (error) {
            output.textContent = `解析错误: ${error.message}`;
        }
    }

    // 解析Java代码为JSON
    parseJavaToJSON(javaCode) {
        const fieldRegex = /private\s+(\w+(?:<[^>]+>)?)\s+(\w+);/g;
        const result = {};
        let match;
        
        while ((match = fieldRegex.exec(javaCode)) !== null) {
            const [, type, fieldName] = match;
            result[fieldName] = this.getDefaultValueForType(type);
        }
        
        return result;
    }

    // 根据类型获取默认值
    getDefaultValueForType(type) {
        if (type.includes('String')) return '';
        if (type.includes('Integer') || type.includes('int')) return 0;
        if (type.includes('Double') || type.includes('double')) return 0.0;
        if (type.includes('Boolean') || type.includes('boolean')) return false;
        if (type.includes('List')) return [];
        if (type.includes('Date')) return new Date().toISOString();
        return null;
    }

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
            const leftObj = JSON.parse(leftInput);
            const rightObj = JSON.parse(rightInput);
            
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
            const val1 = obj1[key];
            const val2 = obj2[key];
            
            if (!(key in obj1)) {
                differences.push({ type: 'added', path: currentPath, value: val2 });
            } else if (!(key in obj2)) {
                differences.push({ type: 'deleted', path: currentPath, value: val1 });
            } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                if (typeof val1 === 'object' && typeof val2 === 'object' && !Array.isArray(val1) && !Array.isArray(val2)) {
                    differences.push(...this.compareObjects(val1, val2, currentPath));
                } else {
                    differences.push({ type: 'changed', path: currentPath, oldValue: val1, newValue: val2 });
                }
            }
        }
        
        return differences;
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
                        return `<div class="diff-item added">+ 新增: ${diff.path} = ${JSON.stringify(diff.value)}</div>`;
                    case 'deleted':
                        return `<div class="diff-item deleted">- 删除: ${diff.path} = ${JSON.stringify(diff.value)}</div>`;
                    case 'changed':
                        return `<div class="diff-item changed">~ 修改: ${diff.path}<br>  旧值: ${JSON.stringify(diff.oldValue)}<br>  新值: ${JSON.stringify(diff.newValue)}</div>`;
                    default:
                        return '';
                }
            }).join('')}
        </div>`;
    }
} 