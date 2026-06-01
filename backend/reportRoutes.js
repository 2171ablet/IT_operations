"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportService_1 = require("../services/reportService");
const router = (0, express_1.Router)();
router.get('/templates', (_req, res) => {
    try {
        const templates = reportService_1.reportService.getTemplates();
        res.json({ success: true, data: templates });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/templates/:id', (req, res) => {
    try {
        const template = reportService_1.reportService.getTemplate(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, error: '模板不存在' });
        }
        res.json({ success: true, data: template });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/templates', (req, res) => {
    try {
        const { name, description, type, content, variables } = req.body;
        const template = reportService_1.reportService.createTemplate({
            name,
            description,
            type,
            content,
            variables,
            is_preset: false
        });
        res.status(201).json({ success: true, data: template });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/templates/:id', (req, res) => {
    try {
        const { name, description, content, variables } = req.body;
        const template = reportService_1.reportService.updateTemplate(req.params.id, {
            name,
            description,
            content,
            variables
        });
        if (!template) {
            return res.status(404).json({ success: false, error: '模板不存在' });
        }
        res.json({ success: true, data: template });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/templates/:id', (req, res) => {
    try {
        const deleted = reportService_1.reportService.deleteTemplate(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: '模板不存在或为预设模板不可删除' });
        }
        res.json({ success: true, message: '模板已删除' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/', (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const reports = reportService_1.reportService.getReports(limit);
        res.json({ success: true, data: reports });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/:id', (req, res) => {
    try {
        const deleted = reportService_1.reportService.deleteReport(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: '报告不存在' });
        }
        res.json({ success: true, message: '报告已删除' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/:id', (req, res) => {
    try {
        const report = reportService_1.reportService.getReport(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, error: '报告不存在' });
        }
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/generate', (req, res) => {
    try {
        const { templateId, variables, format } = req.body;
        const report = reportService_1.reportService.generateReport(templateId, variables, format);
        res.status(201).json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/:id/export', async (req, res) => {
    try {
        const format = req.query.format || 'pdf';
        const exported = await reportService_1.reportService.exportReport(req.params.id, format);
        const report = reportService_1.reportService.getReport(req.params.id);
        res.setHeader('Content-Type', exported.type);
        res.setHeader('Content-Disposition', `attachment; filename="${report?.name || 'report'}.${format === 'pdf' ? 'txt' : format === 'word' ? 'txt' : 'md'}"`);
        res.send(exported.content);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/scheduled/all', (_req, res) => {
    try {
        const reports = reportService_1.reportService.getScheduledReports();
        res.json({ success: true, data: reports });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/scheduled/:id', (req, res) => {
    try {
        const report = reportService_1.reportService.getScheduledReport(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, error: '定时报告不存在' });
        }
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/scheduled', (req, res) => {
    try {
        const { name, template_id, cron_expression, enabled, recipients, format } = req.body;
        const report = reportService_1.reportService.createScheduledReport({
            name,
            template_id,
            cron_expression,
            enabled: enabled !== undefined ? enabled : true,
            recipients,
            format: format || 'markdown'
        });
        res.status(201).json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/scheduled/:id', (req, res) => {
    try {
        const { name, template_id, cron_expression, enabled, recipients, format } = req.body;
        const report = reportService_1.reportService.updateScheduledReport(req.params.id, {
            name,
            template_id,
            cron_expression,
            enabled,
            recipients,
            format
        });
        if (!report) {
            return res.status(404).json({ success: false, error: '定时报告不存在' });
        }
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/scheduled/:id', (req, res) => {
    try {
        const deleted = reportService_1.reportService.deleteScheduledReport(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: '定时报告不存在' });
        }
        res.json({ success: true, message: '定时报告已删除' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map