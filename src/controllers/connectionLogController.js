// src/controllers/connectionLogController.js
const connectionLogService = require('../services/connectionLogService');
const { validationResult } = require('express-validator');

async function getAllConnectionLogs(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let {
            page = 1,
            pageSize = 50,
            ip,       // playerIp
            username, // playerName
            fromTime, // connectedAt >= fromTime
            toTime,    // connectedAt <= toTime
            server
        } = req.query;

        page = parseInt(page, 10);
        pageSize = parseInt(pageSize, 10);

        const result = await connectionLogService.getConnectionLogs({
            page,
            pageSize,
            ip,
            username,
            fromTime,
            toTime,
            server
        });


        return res.json(result);
    } catch (error) {
        console.error(`Error fetching connection logs: ${error.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getConnectionLogById(req, res) {
    try {
        const { id } = req.params;
        const log = await connectionLogService.getConnectionLogById(id);
        if (!log) {
            return res.status(404).json({ message: 'Connection log not found' });
        }
        return res.json(log);
    } catch (error) {
        console.error(`Error fetching connection log (${req.params.id}): ${error.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getConnectionLogByServerId(req, res) {
    try {
        const { serverId } = req.params;
        const logs = await connectionLogService.getConnectionLogByServerId(serverId);
        return res.json(logs);
    } catch (error) {
        console.error(`Error fetching connection logs by server ID (${req.params.serverId}): ${error.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    
}

async function createConnectionLog(req, res) {
    // 驗證參數
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    /**
     * 前端只需要送：
     * {
     *   "fullDomain": "mc.example.com",
     *   "playerName": "Steve",
     *   "playerIp": "123.45.67.89"
     * }
     * 不用再送 serverId
     */
    const { fullDomain, playerName, playerIp, playerUuid } = req.body;
    try {
        const newLog = await connectionLogService.createConnectionLog({
            fullDomain,
            playerName,
            playerIp,
            playerUuid
        });
        newLog.isCustomDomain = !fullDomain.endsWith(`.${process.env.SECOND_LEVEL_DOMAIN}`);
        return res.status(201).json(newLog);
    } catch (error) {
        console.error(`Error creating connection log: ${error.message}`);
        return res.status(500).json({ message: `Error creating connection log: ${error.message}` });
    }
}

async function deleteConnectionLog(req, res) {
    try {
        const { id } = req.params;
        const success = await connectionLogService.deleteConnectionLog(id);
        if (!success) {
            return res.status(404).json({ message: 'Connection log not found or already deleted' });
        }
        return res.status(204).send();
    } catch (error) {
        console.error(`Error deleting connection log (${req.params.id}): ${error.message}`);
        return res.status(500).json({ message: `Error deleting connection log: ${error.message}` });
    }
}

module.exports = {
    getAllConnectionLogs,
    getConnectionLogById,
    createConnectionLog,
    deleteConnectionLog,
    getConnectionLogByServerId
};
