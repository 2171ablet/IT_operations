"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const database_1 = __importDefault(require("../models/database"));
const crypto_1 = require("crypto");
class ReportService {
    constructor() {
        this.presetTemplates = [
            {
                name: '故障报告模板',
                description: '标准故障处理报告',
                type: 'incident',
                content: `# 故障处理报告

## 基本信息
- **故障时间**: {{start_time}}
- **恢复时间**: {{end_time}}
- **故障级别**: {{severity}}
- **影响范围**: {{impact}}

## 故障描述
{{description}}

## 问题排查过程
{{troubleshooting}}

## 根因分析
{{root_cause}}

## 解决方案
{{solution}}

## 预防措施
{{prevention}}

## 附件
{{attachments}}

---
报告生成时间: {{generated_time}}
报告人: {{reporter}}`,
                variables: ['start_time', 'end_time', 'severity', 'impact', 'description', 'troubleshooting', 'root_cause', 'solution', 'prevention', 'attachments', 'generated_time', 'reporter'],
                is_preset: true
            },
            {
                name: '系统巡检报告模板',
                description: '定期系统健康检查报告',
                type: 'inspection',
                content: `# 系统巡检报告

## 巡检概览
- **巡检时间**: {{inspection_time}}
- **巡检范围**: {{scope}}
- **巡检人**: {{inspector}}

## 服务器状态
{{server_status}}

## 数据库状态
{{database_status}}

## 网络状态
{{network_status}}

## 应用状态
{{application_status}}

## 发现的问题
{{issues}}

## 改进建议
{{recommendations}}

---
报告生成时间: {{generated_time}}`,
                variables: ['inspection_time', 'scope', 'inspector', 'server_status', 'database_status', 'network_status', 'application_status', 'issues', 'recommendations', 'generated_time'],
                is_preset: true
            },
            {
                name: '变更记录模板',
                description: '系统变更操作记录',
                type: 'change',
                content: `# 变更记录

## 变更信息
- **变更时间**: {{change_time}}
- **变更类型**: {{change_type}}
- **变更人**: {{change_person}}
- **审核人**: {{reviewer}}

## 变更内容
{{content}}

## 变更原因
{{reason}}

## 变更影响
{{impact}}

## 回滚方案
{{rollback}}

## 执行结果
{{result}}

---
报告生成时间: {{generated_time}}`,
                variables: ['change_time', 'change_type', 'change_person', 'reviewer', 'content', 'reason', 'impact', 'rollback', 'result', 'generated_time'],
                is_preset: true
            }
        ];
    }
    init() {
        try {
            this.initializePresetTemplates();
        }
        catch {
            console.error("⚠️  ReportService initialization failed");
        }
    }
    initializePresetTemplates() {
        try {
            const existingCount = database_1.default.prepare('SELECT COUNT(*) as count FROM reports WHERE is_preset = 1 AND type = \'template\'').get();
            if (existingCount.count === 0) {
                for (const template of this.presetTemplates) {
                    database_1.default.prepare(`
            INSERT INTO reports (id, name, type, content, variables, is_preset, created_at, updated_at)
            VALUES (?, ?, 'template', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `).run((0, crypto_1.randomUUID)(), template.name, template.content, JSON.stringify(template.variables), 1);
                }
            }
        }
        catch {
            console.error("⚠️  Could not initialize report templates");
        }
    }
    getTemplates() {
        const templates = database_1.default.prepare('SELECT * FROM reports WHERE type = \'template\' ORDER BY is_preset DESC, created_at DESC').all();
        return templates.map(t => ({
            id: t.id,
            name: t.name,
            description: '',
            type: 'inspection',
            content: t.content,
            variables: JSON.parse(t.variables || '[]'),
            is_preset: Boolean(t.is_preset),
            created_at: t.created_at,
            updated_at: t.updated_at
        }));
    }
    getTemplate(id) {
        const template = database_1.default.prepare('SELECT * FROM reports WHERE id = ? AND type = \'template\'').get(id);
        if (!template)
            return null;
        return {
            id: template.id,
            name: template.name,
            description: '',
            type: 'inspection',
            content: template.content,
            variables: JSON.parse(template.variables || '[]'),
            is_preset: Boolean(template.is_preset),
            created_at: template.created_at,
            updated_at: template.updated_at
        };
    }
    createTemplate(template) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        database_1.default.prepare(`
      INSERT INTO reports (id, name, type, content, variables, is_preset, created_at, updated_at)
      VALUES (?, ?, 'template', ?, ?, ?, ?, ?)
    `).run(id, template.name, template.content, JSON.stringify(template.variables), template.is_preset ? 1 : 0, now, now);
        return this.getTemplate(id);
    }
    updateTemplate(id, template) {
        const existing = this.getTemplate(id);
        if (!existing)
            return null;
        const updates = [];
        const params = [];
        if (template.name !== undefined) {
            updates.push('name = ?');
            params.push(template.name);
        }
        if (template.content !== undefined) {
            updates.push('content = ?');
            params.push(template.content);
        }
        if (template.variables !== undefined) {
            updates.push('variables = ?');
            params.push(JSON.stringify(template.variables));
        }
        if (updates.length > 0) {
            updates.push('updated_at = ?');
            params.push(new Date().toISOString(), id);
            database_1.default.prepare(`UPDATE reports SET ${updates.join(', ')} WHERE id = ? AND type = 'template'`).run(...params);
        }
        return this.getTemplate(id);
    }
    deleteTemplate(id) {
        const result = database_1.default.prepare('DELETE FROM reports WHERE id = ? AND is_preset = 0 AND type = \'template\'').run(id);
        return result.changes > 0;
    }
    generateReport(templateId, variables, format = 'markdown') {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error('模板不存在');
        }
        let content = template.content;
        for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        database_1.default.prepare(`
      INSERT INTO reports (id, name, type, content, format, metadata, variables, created_at)
      VALUES (?, ?, 'generated', ?, ?, ?, ?, ?)
    `).run(id, `${template.name} - ${new Date().toLocaleString()}`, content, format, JSON.stringify({ templateId, variables }), JSON.stringify(variables), now);
        return {
            id,
            name: `${template.name} - ${new Date().toLocaleString()}`,
            type: template.type,
            content,
            format,
            metadata: { templateId, variables },
            created_at: now
        };
    }
    getReports(limit = 20) {
        const reports = database_1.default.prepare(`
      SELECT * FROM reports 
      WHERE type IN (\'generated\', \'workflow\') 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);
        return reports.map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            content: r.content,
            format: r.format,
            metadata: JSON.parse(r.metadata || '{}'),
            created_at: r.created_at
        }));
    }
    getReport(id) {
        const report = database_1.default.prepare('SELECT * FROM reports WHERE id = ? AND type IN (\'generated\', \'workflow\')').get(id);
        if (!report)
            return null;
        return {
            id: report.id,
            name: report.name,
            type: report.type,
            content: report.content,
            format: report.format,
            metadata: JSON.parse(report.metadata || '{}'),
            created_at: report.created_at
        };
    }
    deleteReport(id) {
        const result = database_1.default.prepare('DELETE FROM reports WHERE id = ? AND type IN (\'generated\', \'workflow\')').run(id);
        return result.changes > 0;
    }

    getScheduledReports() {
        const reports = database_1.default.prepare('SELECT * FROM report_schedules ORDER BY created_at DESC').all();
        return reports.map(r => ({
            id: r.id,
            name: r.name,
            template_id: r.template_id,
            cron_expression: r.cron_expression,
            recipients: JSON.parse(r.recipients || '[]'),
            format: r.format,
            enabled: Boolean(r.enabled),
            last_generated: r.last_generated || undefined,
            created_at: r.created_at,
            updated_at: r.updated_at
        }));
    }
    createScheduledReport(report) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        database_1.default.prepare(`
      INSERT INTO report_schedules (id, name, template_id, cron_expression, enabled, recipients, format, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, report.name, report.template_id, report.cron_expression, report.enabled ? 1 : 0, JSON.stringify(report.recipients), report.format, now, now);
        return this.getScheduledReport(id);
    }
    getScheduledReport(id) {
        const report = database_1.default.prepare('SELECT * FROM report_schedules WHERE id = ?').get(id);
        if (!report)
            return null;
        return {
            id: report.id,
            name: report.name,
            template_id: report.template_id,
            cron_expression: report.cron_expression,
            recipients: JSON.parse(report.recipients || '[]'),
            format: report.format,
            enabled: Boolean(report.enabled),
            last_generated: report.last_generated || undefined,
            created_at: report.created_at,
            updated_at: report.updated_at
        };
    }
    updateScheduledReport(id, report) {
        const existing = this.getScheduledReport(id);
        if (!existing)
            return null;
        const updates = [];
        const params = [];
        if (report.name !== undefined) {
            updates.push('name = ?');
            params.push(report.name);
        }
        if (report.template_id !== undefined) {
            updates.push('template_id = ?');
            params.push(report.template_id);
        }
        if (report.cron_expression !== undefined) {
            updates.push('cron_expression = ?');
            params.push(report.cron_expression);
        }
        if (report.enabled !== undefined) {
            updates.push('enabled = ?');
            params.push(report.enabled ? 1 : 0);
        }
        if (report.recipients !== undefined) {
            updates.push('recipients = ?');
            params.push(JSON.stringify(report.recipients));
        }
        if (report.format !== undefined) {
            updates.push('format = ?');
            params.push(report.format);
        }
        if (updates.length > 0) {
            updates.push('updated_at = ?');
            params.push(new Date().toISOString(), id);
            database_1.default.prepare(`UPDATE report_schedules SET ${updates.join(', ')} WHERE id = ?`).run(...params);
        }
        return this.getScheduledReport(id);
    }
    deleteScheduledReport(id) {
        const result = database_1.default.prepare('DELETE FROM report_schedules WHERE id = ?').run(id);
        return result.changes > 0;
    }
    async exportReport(reportId, format = 'pdf') {
        const report = this.getReport(reportId);
        if (!report) {
            throw new Error('报告不存在');
        }
        if (format === 'pdf') {
            return {
                content: `# PDF导出: ${report.name}\n\n${report.content}`,
                type: 'text/plain'
            };
        }
        else if (format === 'word') {
            return {
                content: `# Word导出: ${report.name}\n\n${report.content}`,
                type: 'text/plain'
            };
        }
        return {
            content: report.content,
            type: 'text/markdown'
        };
    }
}
exports.reportService = new ReportService();
//# sourceMappingURL=reportService.js.map