module.exports = {
	name: 'ready',
	once: true,
	async execute(client, modules) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};