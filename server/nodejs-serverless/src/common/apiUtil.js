import axios from 'axios';

class AppUtil {
    async getApi(url, requestConfig) {
        console.log(url, requestConfig);
        return await axios.get(url, requestConfig);
    }

}

export default AppUtil
