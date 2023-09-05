const dotenv = require('dotenv').config();

module.exports = {
    secretKey: '867-5309867-5310867-5311867-5313',
    mongoUrl: process.env.SECRET_URL,
    facebook: {
        clientId: process.env.FACEBOOK_APPID,
        clientSecret: process.env.FACEBOOK_APPSECRET
    },
    testAdmin: {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
    },
    testUser1: {
        username: process.env.USER1_USERNAME,
        password: process.env.USER1_PASSWORD
    },
    testUser2: {
        username: process.env.USER2_USERNAME,
        password: process.env.USER2_PASSWORD
    }

}

