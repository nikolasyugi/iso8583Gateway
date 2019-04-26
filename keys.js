module.exports = function (dotenv) {

    dotenv.config();
    keys = {
        dbUrl: process.env.MONGO_URL
    }

    return keys;
}