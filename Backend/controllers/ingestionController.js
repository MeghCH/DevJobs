const ingestionService = require('../services/ingestionService');

/**
 * @description Ingestion Controller
 * Handles manual trigger of WeLoveDevs data ingestion
 */
const IngestionController = {
    /**
     * @route POST /api/ingest
     * @desc Trigger WeLoveDevs data ingestion (admin only)
     * @access Private (Admin)
     */
    async trigger(req, res) {
        try {
            console.log('[Ingestion] Manual trigger started by admin');
            const stats = await ingestionService.run();

            return res.status(200).json({
                success: true,
                message: 'Ingestion completed successfully',
                data: stats
            });
        } catch (error) {
            console.error('[Ingestion] Controller error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ingestion failed',
                error: error.message
            });
        }
    }
};

module.exports = IngestionController;
