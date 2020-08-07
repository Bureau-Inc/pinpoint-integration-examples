import ApplicationCache from '../cache/applicationCache';

const express = require('express');
const router = express.Router();
const applicationCache = new ApplicationCache();

router.post("/callback", async function (req, res) {
    try {
        const callbackData = req.body
        await applicationCache.setById(callbackData.correlationId, callbackData.status)

        res.json()
    }
    catch (e) {
        console.log(`Error while /callback :${e}`)
        res.status(500).send({ code: "500", message: e.message })
    }

});

export { router as callback }
