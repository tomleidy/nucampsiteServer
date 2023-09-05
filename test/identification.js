const config = require('../config');


const logins = {
    user1: config.testUser1,
    user2: config.testUser2,
    admin: config.testAdmin
}
const tokens = {
    user1: "",
    user2: "",
    admin: ""
}


const posts = {
    campsiteId: "",
    commentCampsiteId: "",
    commentId: "",
    promotionId: "",
    partnerId: ""
}


module.exports = { logins, tokens, posts };