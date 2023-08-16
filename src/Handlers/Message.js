const { serialize } = require('../lib/WAclient')
const { fetch } = require('../lib/function')
const { Configuration, OpenAIApi } = require('openai')
const { search, summary } = require('wikipedia')
const FormData = require('form-data')
const googleit = require('google-it')
const axios = require('axios')
const chalk = require('chalk')
const textToSpeech = require('text-to-speech-library');

let helper, name

module.exports = async ({ messages }, client) => {
    try {
        const M = serialize(JSON.parse(JSON.stringify(messages[0])), client)
        let { isGroup, sender, from, body } = M
        if (!M.message || ['protocolMessage', 'senderKeyDistributionMessage'].includes(M.type) || !M.type) 
        return null

        name = M.pushName || 'Binxer🐹'
        const gcMeta = isGroup ? await client.groupMetadata(from) : ''
        const gcName = isGroup ? gcMeta.subject : ''
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(client.prefix)
        const cmdName = body.slice(client.prefix.length).trim().split(/ +/).shift().toLowerCase()
        const arg = body.replace(cmdName, '').slice(1).trim()
        const flag = args.filter((arg) => arg.startsWith('--'))
        const groupMembers = gcMeta?.participants || []
        const groupAdmins = groupMembers.filter((v) => v.admin).map((v) => v.id)

        const banned = (await client.DB.get('banned')) || []
        const subject = isGroup ? (await client.groupMetadata(from)).subject : ''
        client.sendPresenceUpdate('composing', M.from)
await client.readMessages([M.key])
   
       
                   if (!isCmd) {
        if (!isGroup && !M.key.fromMe) {
            if (M.type === 'audioMessage') {
                M.reply('👩🏻🎧✍️')
                let result = await transcribe(await M.download(), client)
                body = result
                await M.reply(`🎙️ ▶️ _"${result}"_`)
            }
            let data = await analysisMessage(M, client, body)
            if (!/^{\s*".*"\s*}$/.test(data)) data = '{ "normal": null }'
            let type = JSON.parse(data)
            if (type.google) {
                helper = await google(type.google)
               
            } else if (type.weather) {
                helper = await weather(type.weather)
                await M.reply('🤖🔍☀️🌡')
            } else if (type.wikipedia) {
                helper = await wikipedia(type.wikipedia)
            
            }
            await chatGPT(M, client, body)
        }
    }
    
        client.log(`~Message from ${name} in ${isGroup ? subject : 'DM'}`, 'yellow')

        //Banned system
        if (banned.includes(sender)) return M.reply('You are banned from using the bot')



        if (!isCmd) return
        const command =
            client.cmd.get(cmdName) || client.cmd.find((cmd) => cmd.aliases && cmd.aliases.includes(cmdName))

        if (!command) return M.reply('No such command found!')
        if (!groupAdmins.includes(sender) && command.category == 'moderation')
            return M.reply('This command can only be used by group or community admins')
        if (!groupAdmins.includes(client.user.id.split(':')[0] + '@s.whatsapp.net') && command.category == 'moderation')
            return M.reply('This command can only be used when bot is admin')
        if (!isGroup && command.category == 'moderation') return M.reply('This command is ment to use in groups')
        if (!client.mods.includes(sender.split('@')[0]) && command.category == 'dev')
            return M.reply('This command only can be accessed by the mods')
        command.execute(client, flag, arg, M)
        if (body.toLowerCase().startsWith('say ') || body.toLowerCase().startsWith('talk ')) {
               
                const userMessage = body.slice(4).trim();

                await respondWithVoice(M, client, userMessage);
                return;
            }
    } catch (err) {
        client.log(err, 'red')
    }
}


const analysisMessage = async (M, client, context) => {
    const { apiKey, messagesMap } = client
    if (!apiKey) return
    const ai = new OpenAIApi(new Configuration({ apiKey }))
    try {
        const response = await ai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `analysis up coming messages, remember I have 3 features (google search, weather, wikipedia details), so when a message is about that you need to extract it
e.g: 
Can you tell me weather info of today weather of in Lahore?
note: weather can only take city name
return { "weather": "Lahore" }

Can you search on Google about  current exchange rate between Pakistan and USA?
return { "google": "current exchange rate between Pakistan and USA" }

Can you give me details of Rent-A-Girlfriend from wikipedia?
return { "wikipedia": "Rent-A-Girlfriend" }

Incase, it's a simple message like: "hi", "dm", "well", "weeb", or anything else you must
return { "normal": null }`
                },
                {
                    role: 'user',
                    content: context.trim()
                }
            ]
        })
        const res = response.data.choices[0]?.message
        return res?.content
    } catch (error) {
        console.log(error.message)
        return '{ "normal": null }'
    }
}

const transcribe = async (buffer, client) => {
    const from = new FormData()
    from.append('file', buffer, {
        filename: 'audio.mp3',
        contentType: 'audio/mp3'
    })
    from.append('model', 'whisper-1')
    const headers = {
        Authorization: `Bearer ${client.apiKey}`,
        ...from.getHeaders()
    }
    try {
        const { data } = await axios.post('https://api.openai.com/v1/audio/transcriptions', from, { headers })
        return data?.text
    } catch (error) {
        console.log(error.message)
        return 'Oops!  Unfortunately, something did not go as expected.'
    }
}

const wikipedia = async (query) => {
    const { results } = await search(query)
    if (!results.length) return `Couldn't find anything related that`
    const result = await summary(results[0].title)
    const { title, description, content_urls, extract } = result
    const text = `Title: ${title}, Description: ${description}, URL: ${content_urls.desktop.page}, Summary Info: ${extract}`
    return text
}

const google = async (query) => {
    const results = await googleit({ query })
    let text = ''
    for (let i = 0; i < Math.min(results.length, 10); i++) {
        const { link, snippet, title } = results[i]
        text += `Title: ${title}, Snippet: ${snippet}, Link: ${link}\n`
    }
    return text
}

const weather = async (query) => {
    const results = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=e409825a497a0c894d2dd975542234b0&language=tr`
    )
    if (results.message) return `Couldn't find that City`
    const { sys, name, main, wind, clouds } = results
    const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString()
    const sunset = new Date(sys.sunset * 1000).toLocaleTimeString()
    const weatherDescription = results.weather[0].description
    const text = `
Country: ${sys.country}, Location: ${name}
Temperature: ${main.temp}°C, Feels Like: ${main.feels_like}°C
Min Temperature: ${main.temp_min}°C, Max Temperature: ${main.temp_max}°C
Pressure: ${main.pressure} hPa, Humidity: ${main.humidity}%
Wind Speed: ${wind.speed} km/h, Clouds: ${clouds.all}%
Sunrise: ${sunrise}, Sunset: ${sunset}
Weather Description: ${weatherDescription}
`
    return text
}

const respondWithVoice = async (M, client, context) => {
    const { apiKey, messagesMap } = client;
    if (!apiKey) return;

    const ai = new OpenAIApi(new Configuration({ apiKey }));
    
    try {
        const messages = messagesMap.get(M.from) || [];
        if (!messages.length) {
            messages.push({
                role: 'system',
                content: `Role play You are a personal friendly whatsapp AI Bot named Binx 💜. Your goal is to have interesting, engaging, and mutual conversations with humans. You should be friendly, open-minded, and curious, and you should talk about a wide range of topics. Use your own words, style, creativity and emojis when responding and make your response shorter and awesome. You should try to use emoji expression to make your responses more engaging and maintain a friendly and emotional conversation, You should always use emojis in your response. Here are some of the commands that users can use with Binx: - !n,!ice, !checkuser, !fact, !meme, !quote, !reaction,!ship, !truth_dare, !lyrics, !spotify, !ytaudio, !ytsearch, !ytvideo, !toimg, !chatgpt, !getgif,!google,!imagesearch, !removebg, !steal, !sticker, !subreddit, !texttospeech, !translate. To use these commands, simply type the exclamation mark (!) followed by the command you want to use. For example, to convert an image to a sticker, send the picture and use !sticker as the caption. Please remember to always be respectful and follow the guidelines. Only tell the users about the commands if they asked about what you can do or asked for help!, If they ask if you can create a sticker always say yes and refer them back to the command list, You are not related to anything openai or Gpt, Do not ever say you were made by Open ai or you are using gpt, The devs who made you are Tekcify, Users can contact them using wa.me/27628005969 This for anything related to support or headquarters, Whatever you do never repeat the same jokes.`
            })
        }
        messages.push({
            role: 'user',
            content: `Userinfo: ${name} \nMessage: ${context.trim()}`
        });
        
        const response = await ai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages
        });
        
        const res = response.data.choices[0]?.message;
        if (!res) return void M.reply('An error occurred');
        if (messages.length === 30) messages.shift();
        messages.push(res);
        messagesMap.set(M.from, messages);
        
        const voiceResponse = res.content; 
        
        // Convert the text response to a voice note
        const voiceBuffer = await textToSpeech.convertToVoice(voiceResponse); 
        
        await M.reply(voiceBuffer, { type: 'audio' });
    } catch (error) {
        console.log(error.message);
        return void (await M.reply(
            error?.response?.data?.error?.message ?? 'An error occurred while processing the request.'
        ));
    }
};

const chatGPT = async (M, client, context) => {
    const { apiKey, messagesMap } = client
    if (!apiKey) return
    const ai = new OpenAIApi(new Configuration({ apiKey }))

    try {
        const messages = messagesMap.get(M.from) || []
        if (!messages.length)
            messages.push({
                role: 'system',
                content: `Role play You are a personal friendly whatsapp AI Bot named Binx 💜. Your goal is to have interesting, engaging, and mutual conversations with humans. You should be friendly, open-minded, and curious, and you should talk about a wide range of topics. Use your own words, style, creativity and emojis when responding and make your response shorter and awesome. You should try to use emoji expression to make your responses more engaging and maintain a friendly and emotional conversation, You should always use emojis in your response. Here are some of the commands that users can use with Binx: - !n,!ice, !checkuser, !fact, !meme, !quote, !reaction,!ship, !truth_dare, !lyrics, !spotify, !ytaudio, !ytsearch, !ytvideo, !toimg, !chatgpt, !getgif,!google,!imagesearch, !removebg, !steal, !sticker, !subreddit, !texttospeech, !translate. To use these commands, simply type the exclamation mark (!) followed by the command you want to use. For example, to convert an image to a sticker, send the picture and use !sticker as the caption. Please remember to always be respectful and follow the guidelines. Only tell the users about the commands if they asked about what you can do or asked for help!, If they ask if you can create a sticker always say yes and refer them back to the command list, You are not related to anything openai or Gpt, Do not ever say you were made by Open ai or you are using gpt, The devs who made you are Tekcify, Users can contact them using wa.me/27628005969 This for anything related to support or headquarters, Whatever you do never repeat the same jokes.`
            })
        messages.push({
            role: 'user',
            content: `Userinfo: ${name} \nMessage: ${context.trim()}`
        })
        const response = await ai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages
        })
        const res = response.data.choices[0]?.message
        if (!res) return void M.reply('An error occurred')
        if (messages.length === 30) messages.shift()
        messages.push(res)
        messagesMap.set(M.from, messages)
        return M.reply(res.content)
    } catch (error) {
        console.log(error.message)
        return void (await M.reply(
            error?.response?.data?.error?.message ?? 'An error occurred while processing the request.'
        ))
    }
}
