const colors = require('colors')
const config = require('@stefcud/configyml')
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');

intents = []

for(const intent in config.bot.intents) {
    intents.push(Intents.FLAGS[config.bot.intents[intent]])
}

const client = new Client({ intents: intents });


async function startup() {


    if(config.modules.enabled == true) {
        // Get all events inside ./events
        const moduleFiles = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));

        // Recur through eventFiles and load them all.
        modules = {}
        for (const file of moduleFiles) {
            const moduler = require(`./modules/${file}`);
            if(config.modules.hasOwnProperty(file.replace(".js", "")) && config.modules[file.replace(".js", "")].enabled == true) {
                if(await moduler.load(client, config) == true) {
                    console.log(colors.yellow(file.replace(".js", ""))+" loaded as type: "+colors.brightYellow("MODULE"))
                    modules[file.replace(".js", "")] = moduler.load(client, config)
                }else{
                    console.log(colors.yellow(file.replace(".js", ""))+" failed to load as type: "+colors.brightYellow("MODULE"))
                }
            }else{
                if(!config.modules.hasOwnProperty(file.replace(".js", ""))) {
                    console.log(colors.yellow(file.replace(".js", ""))+`'s config options have not been defined in config.yml! (${colors.brightYellow("MODULE")})`)
                    require("process").exit()
                }
            }
        }
    }else{
        modules = {}
    }

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
            console.error(colors.brightRed(error));
            const errorembed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('An error occured!')
            .setDescription('An error occured on our end, The command failed to execute!')
            await interaction.reply({ embeds: [errorembed], ephemeral: true });
        }
    });
    
    client.login(config.secrets.token);


}
startup()