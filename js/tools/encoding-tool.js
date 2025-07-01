/**
 * 编码工具类 - 处理Base64、URL、Unicode编解码
 */
class EncodingTool extends BaseTool {
    constructor() {
        super();
        this.name = '编码工具';
    }

    init() {
        this.initBase64Tools();
        this.initURLTools();
        this.initUnicodeTools();
    }

    // 初始化Base64工具
    initBase64Tools() {
        document.getElementById('encodeBase64')?.addEventListener('click', () => {
            this.encodeBase64();
        });
        
        document.getElementById('decodeBase64')?.addEventListener('click', () => {
            this.decodeBase64();
        });
        
        document.getElementById('copyBase64Encode')?.addEventListener('click', () => {
            const content = document.getElementById('base64EncodeOutput').value;
            this.copyToClipboard(content);
        });
        
        document.getElementById('copyBase64Decode')?.addEventListener('click', () => {
            const content = document.getElementById('base64DecodeOutput').value;
            this.copyToClipboard(content);
        });
    }

    // 初始化URL工具
    initURLTools() {
        document.getElementById('encodeUrl')?.addEventListener('click', () => {
            this.encodeURL();
        });
        
        document.getElementById('decodeUrl')?.addEventListener('click', () => {
            this.decodeURL();
        });
        
        document.getElementById('copyUrlEncode')?.addEventListener('click', () => {
            const content = document.getElementById('urlEncodeOutput').value;
            this.copyToClipboard(content);
        });
        
        document.getElementById('copyUrlDecode')?.addEventListener('click', () => {
            const content = document.getElementById('urlDecodeOutput').value;
            this.copyToClipboard(content);
        });
    }

    // 初始化Unicode工具
    initUnicodeTools() {
        document.getElementById('encodeUnicode')?.addEventListener('click', () => {
            this.encodeUnicode();
        });
        
        document.getElementById('decodeUnicode')?.addEventListener('click', () => {
            this.decodeUnicode();
        });
        
        document.getElementById('copyUnicodeEncode')?.addEventListener('click', () => {
            const content = document.getElementById('unicodeEncodeOutput').value;
            this.copyToClipboard(content);
        });
        
        document.getElementById('copyUnicodeDecode')?.addEventListener('click', () => {
            const content = document.getElementById('unicodeDecodeOutput').value;
            this.copyToClipboard(content);
        });
    }

    // Base64编码
    encodeBase64() {
        const input = document.getElementById('base64EncodeInput').value;
        const output = document.getElementById('base64EncodeOutput');
        
        if (!input) {
            output.value = '请输入要编码的文本';
            return;
        }
        
        try {
            const encoded = btoa(unescape(encodeURIComponent(input)));
            output.value = encoded;
        } catch (error) {
            output.value = `编码失败: ${error.message}`;
        }
    }

    // Base64解码
    decodeBase64() {
        const input = document.getElementById('base64DecodeInput').value.trim();
        const output = document.getElementById('base64DecodeOutput');
        
        if (!input) {
            output.value = '请输入Base64编码';
            return;
        }
        
        try {
            const decoded = decodeURIComponent(escape(atob(input)));
            output.value = decoded;
        } catch (error) {
            output.value = `解码失败: ${error.message}`;
        }
    }

    // URL编码
    encodeURL() {
        const input = document.getElementById('urlEncodeInput').value;
        const output = document.getElementById('urlEncodeOutput');
        
        if (!input) {
            output.value = '请输入要编码的URL';
            return;
        }
        
        try {
            const encoded = encodeURIComponent(input);
            output.value = encoded;
        } catch (error) {
            output.value = `编码失败: ${error.message}`;
        }
    }

    // URL解码
    decodeURL() {
        const input = document.getElementById('urlDecodeInput').value.trim();
        const output = document.getElementById('urlDecodeOutput');
        
        if (!input) {
            output.value = '请输入编码后的URL';
            return;
        }
        
        try {
            const decoded = decodeURIComponent(input);
            output.value = decoded;
        } catch (error) {
            output.value = `解码失败: ${error.message}`;
        }
    }

    // Unicode编码
    encodeUnicode() {
        const input = document.getElementById('unicodeEncodeInput').value;
        const output = document.getElementById('unicodeEncodeOutput');
        
        if (!input) {
            output.value = '请输入中文字符';
            return;
        }
        
        try {
            let result = '';
            for (let i = 0; i < input.length; i++) {
                const char = input.charAt(i);
                const code = input.charCodeAt(i);
                if (code > 127) {
                    result += '\\u' + code.toString(16).padStart(4, '0');
                } else {
                    result += char;
                }
            }
            output.value = result;
        } catch (error) {
            output.value = `编码失败: ${error.message}`;
        }
    }

    // Unicode解码
    decodeUnicode() {
        const input = document.getElementById('unicodeDecodeInput').value.trim();
        const output = document.getElementById('unicodeDecodeOutput');
        
        if (!input) {
            output.value = '请输入Unicode编码';
            return;
        }
        
        try {
            const decoded = input.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
            });
            output.value = decoded;
        } catch (error) {
            output.value = `解码失败: ${error.message}`;
        }
    }
} 