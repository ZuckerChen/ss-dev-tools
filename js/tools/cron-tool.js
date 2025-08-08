/**
 * Cron表达式 工具 - 解析与生成
 * 支持5/6字段：
 *  - 5字段: 分 时 日(月) 月 星期
 *  - 6字段: 秒 分 时 日(月) 月 星期
 */
class CronTool extends BaseTool {
    constructor() {
        super();
        this.name = 'Cron工具';
        this.monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        this.weekNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
        this.zhWeek = ['周日','周一','周二','周三','周四','周五','周六'];
    }

    init() {
        // 解析
        document.getElementById('cronParseBtn')?.addEventListener('click', () => {
            this.handleParse();
        });
        document.getElementById('cronInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) this.handleParse();
        });

        // 生成
        document.getElementById('cronGenBtn')?.addEventListener('click', () => {
            this.handleGenerate();
        });
        document.getElementById('cronCopyBtn')?.addEventListener('click', () => {
            const out = document.getElementById('cronGenOutput');
            if (out && out.value.trim()) this.copyToClipboard(out.value.trim());
        });
        // 风格选择影响“含秒”可用性
        document.querySelectorAll('input[name="cronStyle"]').forEach(r => {
            r.addEventListener('change', () => this.syncStyleSecondsRule());
        });
        // 预设交互：切换表单显示
        document.querySelectorAll('input[name="cronPreset"]').forEach(r => {
            r.addEventListener('change', () => this.updatePresetVisibility());
        });
        this.updatePresetVisibility();
        this.syncStyleSecondsRule();
    }

    // 解析入口
    handleParse() {
        const inputEl = document.getElementById('cronInput');
        const expr = (inputEl?.value || '').trim().replace(/\s+/g, ' ');
        const resultEl = document.getElementById('cronParseResult');
        const nextEl = document.getElementById('cronNextTimes');
        if (!expr) {
            if (resultEl) resultEl.innerHTML = '<div class="error">请输入Cron表达式</div>';
            if (nextEl) nextEl.innerHTML = '';
            return;
        }
        try {
            const spec = this.parseCronExpression(expr);
            const desc = this.describeCron(spec);
            if (resultEl) {
                resultEl.innerHTML = `
                    <div class="cron-desc"><strong>说明：</strong>${this.escapeHtml(desc)}</div>
                    <div class="cron-fields">
                        ${this.renderField('秒', spec.hasSeconds ? spec.second : null)}
                        ${this.renderField('分', spec.minute)}
                        ${this.renderField('时', spec.hour)}
                        ${this.renderField('日(月)', spec.dayOfMonth)}
                        ${this.renderField('月', spec.month)}
                        ${this.renderField('星期', spec.dayOfWeek)}
                    </div>
                `;
            }
            const nextTimes = this.computeNextTimes(spec, 10);
            if (nextEl) {
                nextEl.innerHTML = nextTimes.map(d => `<li>${d.toLocaleString('zh-CN')}</li>`).join('');
            }
        } catch (e) {
            if (resultEl) resultEl.innerHTML = `<div class="error">解析失败：${this.escapeHtml(e.message)}</div>`;
            if (nextEl) nextEl.innerHTML = '';
        }
    }

    // 生成入口
    handleGenerate() {
        const style = document.querySelector('input[name="cronStyle"]:checked')?.value || 'unix';
        const includeSeconds = this.getIncludeSeconds(style);
        const preset = document.querySelector('input[name="cronPreset"]:checked')?.value || 'everyNMinutes';
        let expr = '';
        switch (preset) {
            case 'everyNMinutes': {
                const n = this.readInt('presetNMinutes', 1, 59, 5);
                if (style === 'quartz') {
                    expr = `0 0/${n} * * * ?`;
                } else {
                    expr = includeSeconds ? `0 */${n} * * * *` : `*/${n} * * * *`;
                }
                break;
            }
            case 'hourlyAt': {
                const m = this.readInt('presetMinute', 0, 59, 0);
                if (style === 'quartz') {
                    expr = `0 ${m} * * * ?`;
                } else {
                    expr = includeSeconds ? `0 ${m} * * * *` : `${m} * * * *`;
                }
                break;
            }
            case 'dailyAt': {
                const hh = this.readInt('presetHour', 0, 23, 0);
                const mm = this.readInt('presetMinute2', 0, 59, 0);
                if (style === 'quartz') {
                    expr = `0 ${mm} ${hh} * * ?`;
                } else {
                    expr = includeSeconds ? `0 ${mm} ${hh} * * *` : `${mm} ${hh} * * *`;
                }
                break;
            }
            case 'weeklyAt': {
                const dow = parseInt(document.getElementById('presetWeekday')?.value || '1', 10);
                const hh = this.readInt('presetHour2', 0, 23, 9);
                const mm = this.readInt('presetMinute3', 0, 59, 0);
                if (style === 'quartz') {
                    // Quartz 周：0=周日,1=周一,...6=周六；使用 ? 于日
                    expr = `0 ${mm} ${hh} ? * ${dow}`;
                } else {
                    expr = includeSeconds ? `0 ${mm} ${hh} * * ${dow}` : `${mm} ${hh} * * ${dow}`;
                }
                break;
            }
            case 'monthlyAt': {
                const dom = this.readInt('presetDay', 1, 31, 1);
                const hh = this.readInt('presetHour3', 0, 23, 9);
                const mm = this.readInt('presetMinute4', 0, 59, 0);
                if (style === 'quartz') {
                    // Quartz 月：使用 ? 于周
                    expr = `0 ${mm} ${hh} ${dom} * ?`;
                } else {
                    expr = includeSeconds ? `0 ${mm} ${hh} ${dom} * *` : `${mm} ${hh} ${dom} * *`;
                }
                break;
            }
        }
        const out = document.getElementById('cronGenOutput');
        if (out) out.value = expr;
        // 顺带展示解析与下次时间
        const input = document.getElementById('cronInput');
        if (input) input.value = expr;
        this.handleParse();
    }

    getIncludeSeconds(style) {
        const checkbox = document.getElementById('cronWithSeconds');
        if (style === 'quartz') return true;
        return checkbox?.checked;
    }

    syncStyleSecondsRule() {
        const style = document.querySelector('input[name="cronStyle"]:checked')?.value || 'unix';
        const secBox = document.getElementById('cronWithSeconds');
        if (!secBox) return;
        if (style === 'quartz') {
            secBox.checked = true;
            secBox.disabled = true;
            secBox.parentElement?.classList.add('tooltip');
            secBox.parentElement?.setAttribute('data-tooltip', 'Quartz 风格固定包含秒字段');
        } else {
            secBox.disabled = false;
            secBox.parentElement?.classList.remove('tooltip');
            secBox.parentElement?.removeAttribute('data-tooltip');
        }
    }

    updatePresetVisibility() {
        const preset = document.querySelector('input[name="cronPreset"]:checked')?.value;
        const areas = document.querySelectorAll('[data-preset-area]');
        areas.forEach(a => a.classList.add('hidden'));
        switch (preset) {
            case 'everyNMinutes':
                document.querySelector('[data-preset-area="everyNMinutes"]')?.classList.remove('hidden');
                break;
            case 'hourlyAt':
                document.querySelector('[data-preset-area="hourlyAt"]')?.classList.remove('hidden');
                break;
            case 'dailyAt':
                document.querySelector('[data-preset-area="dailyAt"]')?.classList.remove('hidden');
                break;
            case 'weeklyAt':
                document.querySelector('[data-preset-area="weeklyAt"]')?.classList.remove('hidden');
                break;
            case 'monthlyAt':
                document.querySelector('[data-preset-area="monthlyAt"]')?.classList.remove('hidden');
                break;
        }
    }

    readInt(id, min, max, defVal) {
        const v = parseInt(document.getElementById(id)?.value || `${defVal}`, 10);
        if (Number.isNaN(v)) return defVal;
        return Math.min(Math.max(v, min), max);
    }

    // ---------- Cron 解析 ----------
    parseCronExpression(expr) {
        const parts = expr.split(' ');
        if (parts.length < 5 || parts.length > 6) {
            throw new Error('仅支持5或6字段表达式（秒 字段可选）');
        }
        const hasSeconds = parts.length === 6;
        const [sec, min, hour, dom, mon, dow] = hasSeconds ? parts : ['0', parts[0], parts[1], parts[2], parts[3], parts[4]];
        return {
            hasSeconds,
            second: this.parseField(sec, 0, 59, 'second'),
            minute: this.parseField(min, 0, 59, 'minute'),
            hour: this.parseField(hour, 0, 23, 'hour'),
            dayOfMonth: this.parseField(dom, 1, 31, 'dayOfMonth'),
            month: this.parseField(mon, 1, 12, 'month'),
            dayOfWeek: this.parseField(dow, 0, 6, 'dayOfWeek', true)
        };
    }

    parseField(token, min, max, kind, isWeek = false) {
        const original = token;
        // 替换月份/星期名字为数字 & Quartz 兼容
        token = token.toUpperCase();
        if (kind === 'month') {
            this.monthNames.forEach((n, i) => {
                token = token.replace(new RegExp(`\\b${n}\\b`, 'g'), String(i + 1));
            });
        }
        if (kind === 'dayOfWeek') {
            this.weekNames.forEach((n, i) => {
                token = token.replace(new RegExp(`\\b${n}\\b`, 'g'), String(i));
            });
            // 7 视为 周日
            token = token.replace(/\b7\b/g, '0');
        }

        // Quartz 的 ?：仅在 日(月)/星期 中接受，等同于未指定（any）
        if (token === '?' && (kind === 'dayOfMonth' || kind === 'dayOfWeek')) {
            return { any: true, list: null, text: original };
        }

        // 通配 *
        if (token === '*') return { any: true, list: null, text: original };

        const list = [];
        const items = token.split(',');
        for (const raw of items) {
            const stepSplit = raw.split('/');
            let base = stepSplit[0];
            const hasStep = stepSplit.length > 1;
            let step = hasStep ? parseInt(stepSplit[1], 10) : 1;
            if (Number.isNaN(step) || step <= 0) step = 1;

            // 兼容 '/n' 写法 => '*/n'
            if (base === '') base = '*';

            if (base === '*') {
                for (let v = min; v <= max; v += step) list.push(v);
                continue;
            }

            if (base.includes('-')) {
                const [a, b] = base.split('-');
                const start = this.normInt(a, min, max);
                const end = this.normInt(b, min, max);
                if (end < start) throw new Error(`${kind} 字段范围无效: ${base}`);
                for (let v = start; v <= end; v += step) list.push(v);
                continue;
            }

            // 单值，若带步长：从该值起步按步进到最大值
            const startVal = this.normInt(base, min, max);
            if (hasStep) {
                for (let v = startVal; v <= max; v += step) list.push(v);
            } else {
                list.push(startVal);
            }
        }
        // 去重排序
        const uniq = Array.from(new Set(list)).sort((a,b)=>a-b);
        return { any: false, list: uniq, text: original };
    }

    normInt(str, min, max) {
        const v = parseInt(str, 10);
        if (Number.isNaN(v) || v < min || v > max) {
            throw new Error(`取值超出范围(${min}-${max}): ${str}`);
        }
        return v;
    }

    // 文本描述
    describeCron(spec) {
        const parts = [];
        const fmtTime = () => {
            const hh = spec.hour.any ? '每时' : spec.hour.list.map(v=>String(v).padStart(2,'0')).join(',');
            const mm = spec.minute.any ? '每分' : spec.minute.list.map(v=>String(v).padStart(2,'0')).join(',');
            const ss = spec.hasSeconds ? (spec.second.any ? '每秒' : spec.second.list.map(v=>String(v).padStart(2,'0')).join(',')) : '00';
            return `${ss === '00' ? '' : ss + '秒 '}在 ${hh}时${spec.minute.any?'' : ''}${spec.minute.any?'' : ''}${spec.minute.any?'每分':' '}${mm}分`;
        };
        // 月/日/周
        let datePart = '';
        if (!spec.dayOfMonth.any && !spec.dayOfWeek.any) {
            // 两者都限制，采用 OR 语义
            datePart = `每月的第${spec.dayOfMonth.list.join(',')}日 或 每周的${spec.dayOfWeek.list.map(v=>this.zhWeek[v]).join(',')}`;
        } else if (!spec.dayOfMonth.any) {
            datePart = `每月的第${spec.dayOfMonth.list.join(',')}日`;
        } else if (!spec.dayOfWeek.any) {
            datePart = `每周的${spec.dayOfWeek.list.map(v=>this.zhWeek[v]).join(',')}`;
        } else {
            datePart = '每天';
        }
        // 月份
        const monthPart = spec.month.any ? '' : ` 于 ${spec.month.list.map(v=>v+'月').join(',')}`;
        parts.push(datePart + monthPart);
        parts.push(fmtTime());
        return parts.join('，');
    }

    renderField(label, field) {
        if (!field) return '';
        if (field.any) {
            return `<div class="cron-field"><span>${label}</span><code>*</code></div>`;
        }
        return `<div class="cron-field"><span>${label}</span><code>${this.escapeHtml(field.text)}</code><span class="cron-field-values">(${field.list.join(',')})</span></div>`;
    }

    // 计算下次触发
    computeNextTimes(spec, count = 10) {
        const results = [];
        let cursor = new Date();
        cursor.setMilliseconds(0);
        // 下一分钟开始
        cursor.setSeconds(spec.hasSeconds ? cursor.getSeconds() + 1 : 0);
        let safety = 0;
        const limit = 200000; // 最多检查20万步
        while (results.length < count && safety < limit) {
            if (this.matches(spec, cursor)) {
                results.push(new Date(cursor.getTime()));
                // 步进至少一分钟或一秒
                cursor = new Date(cursor.getTime() + (spec.hasSeconds ? 1000 : 60000));
            } else {
                // 步进按最小单位
                cursor = new Date(cursor.getTime() + (spec.hasSeconds ? 1000 : 60000));
            }
            safety++;
        }
        return results;
    }

    matches(spec, date) {
        const sec = date.getSeconds();
        const min = date.getMinutes();
        const hr = date.getHours();
        const dom = date.getDate();
        const mon = date.getMonth() + 1;
        let dow = date.getDay(); // 0-6 周日-周六

        // 字段匹配
        const m = (field, v) => field.any || field.list.includes(v);
        if (spec.hasSeconds && !m(spec.second, sec)) return false;
        if (!m(spec.minute, min)) return false;
        if (!m(spec.hour, hr)) return false;
        if (!m(spec.month, mon)) return false;

        const domAny = spec.dayOfMonth.any;
        const dowAny = spec.dayOfWeek.any;
        const domMatch = m(spec.dayOfMonth, dom);
        const dowMatch = m(spec.dayOfWeek, dow);
        if (domAny && dowAny) {
            return true;
        } else if (domAny && !dowAny) {
            return dowMatch;
        } else if (!domAny && dowAny) {
            return domMatch;
        } else {
            // 两者都有限制：OR 语义
            return domMatch || dowMatch;
        }
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
}


