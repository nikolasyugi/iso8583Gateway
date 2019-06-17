module.exports = function(dotenv) {
	dotenv.config();
	keys = {
		dbUrl: process.env.MONGO_URL,
		port: process.env.PORT,
		ip: process.env.IP,
		maxTimeout: process.env.MAXTIMEOUT,
	};

	return keys;
};
