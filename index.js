const colors = require('colors')
const config = require('@stefcud/configyml')
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

intents = []

for(const intent in config.bot.intents) {
    intents.push(Intents.FLAGS[config.bot.intents[intent]])
}

const client = new Client({ intents: intents });


async function startup() {


    // Checks ./modules and recurs through all files in the directory to load them.
    const modules = "nothing atm"

    // Get all events inside ./events
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

    // Recur through eventFiles and load them all.
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        console.log(colors.yellow(file.replace(".js", ""))+".js loaded as type: "+colors.brightGreen("EVENT"))
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client, modules));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client, modules));
        }
    }
    
    // Creates a collection for commands
    client.commands = new Collection();

    // Get all commands inside ./commands
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    
    // Load all commands into the Collection() variable
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);

        console.log(colors.yellow(file.replace(".js", ""))+".js loaded as type: "+colors.brightBlue("COMMAND"))
    }
    
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
    
        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
    
    client.login(config.secrets.token);


}
startup()