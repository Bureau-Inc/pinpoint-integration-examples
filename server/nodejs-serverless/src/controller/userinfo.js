import ApplicationCache from '../cache/applicationCache';
import UserInfoService from '../service/userInfoService';

const express = require('express');
const router = express.Router();
const applicationCache = new ApplicationCache();
const userInfoService = new UserInfoService()

router.get("/userinfo", async function (req, res, next) {
    try {
        const correlationId = req.query.correlationId
        let mobileNumber = ''
        const verificationStatus = await applicationCache.getById(correlationId)

        console.log('Current user verification status', verificationStatus)
        //verificationStatus as null means merchant haven't received the callback from Bureau, hence we return `Not Found`
        if (verificationStatus === null) {
            res
                .status(404)
                .json({ status: verificationStatus, mobileNumber })
            return
        } else if (verificationStatus === "Success") {
            //if merchant receives the callback as Success from Bureau, then merchant can initiate the Bureau userinfo API to get the mobilenumber
            mobileNumber = await userInfoService.getuserInfo(correlationId)
        }
        res.json({ status: verificationStatus, mobileNumber })
    }
    catch (e) {
        console.log(`Error while /userinfo :${e}`)
        res.status(500).send({ code: "500", message: e.message })
    }

});

export { router as userinfo }
