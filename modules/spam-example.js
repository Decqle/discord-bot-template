exports.load = async function(client, config){
    client.on('ready', function() {
        setInterval(function(){
            console.log("PING")
        }, 250)
    })

    return true
};