const colors = require('colors')
const config = require('@stefcud/configyml')
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');


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
    const commandFolders = fs.readdirSync('./commands')
    
    // Load all commands into the Collection() variable
    for (const file of commandFolders) {
        const commandFiles = fs.readdirSync('./commands/'+file).filter(file => file.endsWith('.js'));
        for (const file2 of commandFiles) {
            const command = require(`./commands/${file}/${file2}`);
            client.commands.set(command.data.name, command);
    
            console.log(colors.yellow(file2.replace(".js", ""))+".js loaded as type: "+colors.brightBlue("COMMAND"))
        }
    }
    
    client.login(config.secrets.token);
}

intents = []

for(const intent in config.bot.intents) {
    intents.push(Intents.FLAGS[config.bot.intents[intent]])
    if(intents.length >= config.bot.intents.length) {
        client = new Client({ intents: intents });
        startup()
    }
}