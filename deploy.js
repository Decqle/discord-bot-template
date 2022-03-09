const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const config = require('@stefcud/configyml')

const commands = [];
const commandFolders = fs.readdirSync('./commands')

for (const file of commandFolders) {
    const commandFiles = fs.readdirSync('./commands/'+file).filter(file => file.endsWith('.js'));
    for (const file2 of commandFiles) {
        const command = require(`./commands/${file}/${file2}`);
	    commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '9' }).setToken(config.secrets.token);

rest.put(Routes.applicationGuildCommands(config.secrets.id, config.secrets.devguildid), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);