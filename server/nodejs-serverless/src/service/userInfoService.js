import axios from 'axios';
import AppUtil from '../common/apiUtil';
import { appConfig } from '../config/appConfig';

const appUtil = new AppUtil()

class UserInfoService {
    async getuserInfo(correlationId) {
        const authHeader = appConfig.BUREAU_CLIENT_ID + ":" + appConfig.BUREAU_CLIENT_SECRET
        const encodedAuthHeader = Buffer.from(authHeader).toString('base64')
        const requestConfig = {
            headers: {
                Authorization: encodedAuthHeader
            },
            params: {
                correlationId
            }
        }
        const userInfoResponse = await appUtil.getApi(appConfig.BUREAU_USER_INFO_URL, requestConfig)
        if (userInfoResponse && userInfoResponse.data) {
            return userInfoResponse.data.mobileNumber
        }
        return null
    }

}

export default UserInfoService
