import Axios from 'axios';

const sendWhatsAppMsg_API = async (number: string, msg: string) => {
    const WHATSAPP_SESSION_ID = process.env.WHATSAPP_SESSION_ID;
    const WHATSAPP_URL = process.env.WHATSAPP_URL;
    const sendMsg_URL = `${WHATSAPP_URL}/client/sendMessage/${WHATSAPP_SESSION_ID}`
    const getNumberId_URL = `${WHATSAPP_URL}/client/getNumberId/${WHATSAPP_SESSION_ID}`

    number = number?.length >= 9 && number.length !== 12 ? ("972" + number.slice(-9)) : number
    const chatData = await Axios.post(getNumberId_URL, { number });
    const data = {
        chatId: chatData.data?.result?._serialized,
        contentType: "string",
        content: msg
    };

    // const response = await 
    Axios.post(sendMsg_URL, data);
}

export { sendWhatsAppMsg_API }
