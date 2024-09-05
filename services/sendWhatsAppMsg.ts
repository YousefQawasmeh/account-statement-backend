const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
      ],
    }
});

client.on('qr', (qr: any) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (message: any) => {
    try{
        if(message.from !== "status@broadcast" ){
            const contact = await message.getContact();
            console.log(contact, message.body);
            if(message.body === "0"){
                await message.reply("00");
            }
        } 
    } catch (error) {
        console.log(error);
    }
})

// client.initialize();

export default client
 