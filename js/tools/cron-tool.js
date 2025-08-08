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

        // 为“指定时间执行”预设设置默认值为当前本地时间（含秒）
        const dt = document.getElementById('presetDateTime');
        if (dt && !dt.value) {
            const now = new Date();
            const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 19);
            dt.value = local;
        }
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
                const fmt = (d) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const da = String(d.getDate()).padStart(2, '0');
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    const ss = String(d.getSeconds()).padStart(2, '0');
                    return `${y}-${m}-${da} ${hh}:${mm}:${ss}`;
                };
                nextEl.innerHTML = nextTimes.map(d => `<li>${fmt(d)}</li>`).join('');
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
            case 'everyNSeconds': {
                const n = this.readInt('presetNSeconds', 1, 59, 5);
                // 仅 Quartz 支持纯“每N秒”；Unix 需含秒字段开启
                const style = document.querySelector('input[name="cronStyle"]:checked')?.value || 'unix';
                if (style === 'quartz') {
                    expr = `0/${n} * * * * ?`;
                } else {
                    // Unix：勾选“含秒”时可用，否则退化为每N分钟
                    const includeSeconds = this.getIncludeSeconds(style);
                    expr = includeSeconds ? `*/${n} * * * * *` : `*/${Math.max(1, Math.min(59, n))} * * * *`;
                }
                break;
            }
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
            case 'onceAt': {
                const dtEl = /** @type {HTMLInputElement|null} */(document.getElementById('presetDateTime'));
                let date = dtEl && dtEl.value ? new Date(dtEl.value) : new Date();
                if (isNaN(date.getTime())) date = new Date();
                const ss = date.getSeconds();
                const mm = date.getMinutes();
                const hh = date.getHours();
                const dom = date.getDate();
                const mon = date.getMonth() + 1;
                const year = date.getFullYear();
                const withYear = !!document.getElementById('presetIncludeYear')?.checked;
                if (style === 'quartz') {
                    // Quartz: 秒 分 时 日 月 星期(用?) [年]
                    expr = withYear ? `${ss} ${mm} ${hh} ${dom} ${mon} ? ${year}` : `${ss} ${mm} ${hh} ${dom} ${mon} ?`;
                } else {
                    // Unix: [秒] 分 时 日 月 星期
                    expr = includeSeconds ? `${ss} ${mm} ${hh} ${dom} ${mon} *` : `${mm} ${hh} ${dom} ${mon} *`;
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
        const yearBox = document.getElementById('presetIncludeYear');
        if (!secBox) return;
        if (style === 'quartz') {
            secBox.checked = true;
            secBox.disabled = true;
            secBox.parentElement?.classList.add('tooltip');
            secBox.parentElement?.setAttribute('data-tooltip', 'Quartz 风格固定包含秒字段');
            if (yearBox) {
                yearBox.disabled = false; // Quartz 可选择7字段年份
                yearBox.parentElement?.classList.remove('tooltip');
                yearBox.parentElement?.removeAttribute('data-tooltip');
            }
        } else {
            secBox.disabled = false;
            secBox.parentElement?.classList.remove('tooltip');
            secBox.parentElement?.removeAttribute('data-tooltip');
            if (yearBox) {
                yearBox.checked = false;
                yearBox.disabled = true; // Unix 不支持年份字段
                yearBox.parentElement?.classList.add('tooltip');
                yearBox.parentElement?.setAttribute('data-tooltip', 'Unix 风格不支持年份字段');
            }
        }
    }

    updatePresetVisibility() {
        const preset = document.querySelector('input[name="cronPreset"]:checked')?.value;
        const areas = document.querySelectorAll('[data-preset-area]');
        areas.forEach(a => a.classList.add('hidden'));
        switch (preset) {
            case 'everyNSeconds':
                document.querySelector('[data-preset-area="everyNSeconds"]')?.classList.remove('hidden');
                break;
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
            case 'onceAt':
                document.querySelector('[data-preset-area="onceAt"]')?.classList.remove('hidden');
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
        if (parts.length < 5 || parts.length > 7) {
            throw new Error('仅支持5、6或7字段表达式（秒/年 字段可选）');
        }
        const hasYear = parts.length === 7;
        const hasSeconds = parts.length >= 6; // 6或7字段均含秒
        const [sec, min, hour, dom, mon, dow, yr] =
            hasYear ? parts : (hasSeconds ? parts.concat([null]) : ['0', parts[0], parts[1], parts[2], parts[3], parts[4], null]);
        return {
            hasSeconds,
            hasYear,
            second: this.parseField(sec, 0, 59, 'second'),
            minute: this.parseField(min, 0, 59, 'minute'),
            hour: this.parseField(hour, 0, 23, 'hour'),
            dayOfMonth: this.parseField(dom, 1, 31, 'dayOfMonth'),
            month: this.parseField(mon, 1, 12, 'month'),
            dayOfWeek: this.parseField(dow, 0, 6, 'dayOfWeek', true),
            year: yr ? this.parseField(yr, 1970, 2099, 'year') : { any: true, list: null, text: '*' }
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
        if (spec.year && !spec.year.any) {
            parts.push(`年份：${spec.year.list.join(',')}`);
        }
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

    // 计算下次触发（智能前进，支持大跨度月份/年份）
    computeNextTimes(spec, count = 10) {
        const results = [];
        let cursor = new Date();
        cursor.setMilliseconds(0);
        if (spec.hasSeconds) {
            cursor.setSeconds(cursor.getSeconds() + 1);
        } else {
            cursor.setSeconds(0);
            cursor.setMinutes(cursor.getMinutes() + 1);
        }

        const firstAllowed = (field, min, max) => field?.any ? min : field.list[0];
        const nextInField = (field, current, min, max) => {
            if (!field || field.any) return current;
            for (let i = 0; i < field.list.length; i++) {
                if (field.list[i] >= current) return field.list[i];
            }
            return null; // 需要进位
        };

        const advanceToNextYear = () => {
            const currentYear = cursor.getFullYear();
            if (!spec.year || spec.year.any) return false;
            // 找到>=当前年的下一个允许年份
            const candidates = spec.year.list.filter(y => y >= currentYear);
            const targetYear = candidates.length ? candidates[0] : spec.year.list[0];
            if (targetYear < currentYear) {
                // 年份回绕到更早的年则直接设置为最小允许年
                cursor = new Date(spec.year.list[0], 0, 1, 0, 0, 0, 0);
            } else if (targetYear > currentYear) {
                cursor = new Date(targetYear, 0, 1, 0, 0, 0, 0);
            } else {
                return false;
            }
            // 初始化为当天/当月最小允许
            const mon = firstAllowed(spec.month, 1, 12) - 1;
            cursor.setMonth(mon, 1);
            cursor.setHours(firstAllowed(spec.hour, 0, 23), firstAllowed(spec.minute, 0, 59), spec.hasSeconds ? firstAllowed(spec.second, 0, 59) : 0, 0);
            return true;
        };

        let safety = 0;
        const LIMIT = 20000; // 智能跳跃，减少循环

        while (results.length < count && safety < LIMIT) {
            safety++;

            // 年份
            if (spec.year && !spec.year.any && !spec.year.list.includes(cursor.getFullYear())) {
                if (advanceToNextYear()) continue;
            }

            // 月份
            if (!spec.month.any && !spec.month.list.includes(cursor.getMonth() + 1)) {
                // 找到>=当前月的下一个允许月
                const curMon = cursor.getMonth() + 1;
                const mons = spec.month.list.filter(m => m >= curMon);
                if (mons.length) {
                    cursor.setMonth(mons[0] - 1, 1);
                } else {
                    // 跳到下一年最小允许月
                    cursor.setFullYear(cursor.getFullYear() + 1, spec.month.list[0] - 1, 1);
                }
                cursor.setHours(0, 0, 0, 0);
                continue;
            }

            // 日期：处理 DOM/DOW 条件
            const domAny = spec.dayOfMonth.any;
            const dowAny = spec.dayOfWeek.any;
            const dom = cursor.getDate();
            const dow = cursor.getDay();
            const domMatch = domAny || spec.dayOfMonth.list.includes(dom);
            const dowMatch = dowAny || spec.dayOfWeek.list.includes(dow);
            let dateOk = false;
            if (domAny && dowAny) dateOk = true;
            else if (domAny && !dowAny) dateOk = dowMatch;
            else if (!domAny && dowAny) dateOk = domMatch;
            else dateOk = domMatch || dowMatch;
            if (!dateOk) {
                // 下一天 00:00:00
                cursor.setDate(cursor.getDate() + 1);
                cursor.setHours(0, 0, 0, 0);
                continue;
            }

            // 小时
            const curH = cursor.getHours();
            const nextH = nextInField(spec.hour, curH, 0, 23);
            if (nextH === null) {
                cursor.setDate(cursor.getDate() + 1);
                cursor.setHours(firstAllowed(spec.hour, 0, 23), 0, 0, 0);
                continue;
            }
            if (nextH !== curH) {
                cursor.setHours(nextH, 0, 0, 0);
            }

            // 分钟
            const curM = cursor.getMinutes();
            const nextM = nextInField(spec.minute, curM, 0, 59);
            if (nextM === null) {
                cursor.setHours(cursor.getHours() + 1, firstAllowed(spec.minute, 0, 59), 0, 0);
                continue;
            }
            if (nextM !== curM) {
                cursor.setMinutes(nextM, 0, 0);
            }

            // 秒
            if (spec.hasSeconds) {
                const curS = cursor.getSeconds();
                const nextS = nextInField(spec.second, curS, 0, 59);
                if (nextS === null) {
                    cursor.setMinutes(cursor.getMinutes() + 1, 0, 0);
                    continue;
                }
                if (nextS !== curS) {
                    cursor.setSeconds(nextS, 0);
                }
            } else {
                cursor.setSeconds(0, 0);
            }

            // 最终检查
            if (this.matches(spec, cursor)) {
                results.push(new Date(cursor.getTime()));
                // 下一步避免重复
                if (spec.hasSeconds) cursor.setSeconds(cursor.getSeconds() + 1);
                else cursor.setMinutes(cursor.getMinutes() + 1);
            } else {
                // 防止卡住，最小步进
                if (spec.hasSeconds) cursor.setSeconds(cursor.getSeconds() + 1);
                else cursor.setMinutes(cursor.getMinutes() + 1);
            }
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
        // 年份限制
        if (spec.year && !m(spec.year, date.getFullYear())) return false;

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


