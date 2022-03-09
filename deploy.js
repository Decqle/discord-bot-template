const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];
const commandFolders = fs.readdirSync('./commands')

for (const file of commandFolders) {
    const commandFiles = fs.readdirSync('./commands/'+file).filter(file => file.endsWith('.js'));
    for (const file2 of commandFiles) {
        const command = require(`./commands/${file}/${file2}`);
	    commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);