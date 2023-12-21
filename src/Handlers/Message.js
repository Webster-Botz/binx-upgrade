const { serialize } = require('../lib/WAclient')
const { fetch, formatSeconds } = require('../lib/function')
const { Configuration, OpenAIApi } = require('openai')
const { audioToSlice } = require('audio-slicer')
const { search, summary } = require('wikipedia')
const FormData = require('form-data')
const googleit = require('google-it')
const axios = require('axios')
const { getAudioUrl } = require('google-tts-api');
const currentUTCTime = new Date().toUTCString()
const userVoiceModeMap = new Map();
const activatedGroups = new Set();
const fs = require('fs')
let helper = '';


const processImage = async (M, client) => {
    try {
        if (M.type === 'imageMessage') {
            // Download the image
            const mediaData = await M.download(M);

            const fileName = `downloaded_image_${Date.now()}.jpg`;
            fs.writeFileSync(fileName, mediaData, 'base64');

            const { data } = await axios.post('https://bard.rizzy.eu.org/backend/conversation/image', {
                image: fs.createReadStream(fileName),
            });

            return void (await client.sendMessage(M.from, { text: data.content, mentions: M.mentioned }));
            fs.unlinkSync(fileName);
        }
    } catch (error) {
        console.error('Error processing image:', error);
        await M.reply('An error occurred while processing the image.');
    }
};


module.exports = async ({ messages }, client) => {
    try {
        const M = serialize(JSON.parse(JSON.stringify(messages[0])), client)
       
        if (!M.message || ['protocolMessage', 'senderKeyDistributionMessage'].includes(M.type) || !M.type) return null
        

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { isGroup, sender, from, body } = M;
const gcMeta = isGroup ? await client.groupMetadata(from) : '';
const subject = isGroup ? gcMeta.subject : '';
const gcName = isGroup ? gcMeta.subject : '';
const isCmd = body.startsWith(client.config?.prefix || ''); // Use optional chaining to handle undefined
const [cmdName, ...args] = body.replace(client.config?.prefix || '', '').split(' ');
const arg = args.filter((x) => !x.startsWith('--')).join(' ');
const flag = args.filter((arg) => arg.startsWith('--'));
const groupMembers = gcMeta?.participants || [];
const groupAdmins = groupMembers.filter((v) => v.admin).map((v) => v.id);
const ActivateMod = (await client.DB.get('mod')) || [];
const ActivateChatBot = (await client.DB.get('chatbot')) || [];
const banned = (await client.DB.get('banned')) || [];

        await client.readMessages([M.key])

        if (M.isGroup) {
            const groupId = M.from;
            if (M.body.startsWith('!activate') && !M.key.fromMe) {
                activatedGroups.add(groupId);
                return void M.reply("Bot activated in this group. Enjoy!");
            }

            if (!activatedGroups.has(groupId) && !M.key.fromMe) {
                return void M.reply("This bot is not activated in this group. Use `!activate` to activate it.");
            }
        }
       
//////////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const userCooldowns = new Map(); 
        if (userCooldowns.has(M.sender)) {
            const lastMessageTime = userCooldowns.get(M.sender);
            const currentTime = Date.now();
            if (currentTime - lastMessageTime < 2000) {
                M.reply("Ah 😅. Too speedy . Please leave a gap between your messages");
            } else {
                userCooldowns.set(M.sender, currentTime);
            }
        } else {
            userCooldowns.set(M.sender, Date.now());
        }
              
        if (!isGroup && !M.key.fromMe) {
            if (M.type === 'audioMessage') {
                const voice = M.message?.audioMessage?.ptt;
                const edit = await M.reply(voice ? '👩🏻👂🎧' : '👩🏻🎧✍️');
                if (!voice) {
                    let text = 'Write a Quick and Short Summary of text below:\n\n';
                    const duration = M.message?.audioMessage?.seconds;
                    if (duration > 600) return void M.reply('You are only allowed to use audio less than 10 minutes');
                    if (duration > 75) {
                        const audios = await audioToSlice(await M.download());
                        if (!audios || !audios.length) return void M.reply('An error occurred');
                        if (audios.length) {
                            const total = audios.length;
                            for (let i = 0; i < total; i++) {
                                const result = await transcribe(audios[i], client);
                                text += result + '\n';
                                setTimeout(async () => {
                                    await client.relayMessage(M.from, {
                                        protocolMessage: {
                                            key: edit.key,
                                            type: 14,
                                            editedMessage: {
                                                conversation: `🎙️ *${1 + i}/${total}* ▶️ _"${result}"_`
                                            }
                                        }
                                    }, {});
                                }, 5000); // 5 seconds timeout
                            }
                            return void (await chatGPT(M, client, text));
                        }
                        const result = await transcribe(await M.download(), client);
                        setTimeout(async () => {
                            await client.relayMessage(M.from, {
                                protocolMessage: {
                                    key: edit.key,
                                    type: 14,
                                    editedMessage: {
                                        conversation: `🎙️ *1/1* ▶️ _"${result}"_`
                                    }
                                }
                            }, {});
                        }, 5000); // 5 seconds timeout
                        text += result;
                        return void (await chatGPT(M, client, text));
                    }
                    const result = await transcribe(await M.download(), client);
                    setTimeout(async () => {
                        await client.relayMessage(M.from, {
                            protocolMessage: {
                                key: edit.key,
                                type: 14,
                                editedMessage: {
                                    conversation: `🎙️ *1/1* ▶️ _"${result}"_`
                                }
                            }
                        }, {});
                    }, 5000); // 5 seconds timeout
                    return void (await chatGPT(M, client, result));
                }
                const result = await transcribe(await M.download(), client);
                setTimeout(async () => {
                    await client.relayMessage(M.from, {
                        protocolMessage: {
                            key: edit.key,
                            type: 14,
                            editedMessage: {
                                conversation: `🎙️ *1/1* ▶️ _"${result}"_`
                            }
                        }
                    }, {});
                }, 5000); // 5 seconds timeout
                return void (await chatGPT(M, client, result));
            }

            if (M.type === 'imageMessage') {
                await processImage(M, client);
            } else if (M.body.startsWith('!voicemode') && !M.key.fromMe) {
                userVoiceModeMap.set(M.sender, true);
                return void M.reply('Voice mode activated! You will now receive voice responses.');
            } else if (M.body.startsWith('!textmode') && !M.key.fromMe) {
                userVoiceModeMap.delete(M.sender);
                return void M.reply('Text mode activated! You will now receive text responses.');
            }
            const isVoiceModeActivated = userVoiceModeMap.get(M.sender);
            if (isVoiceModeActivated) {
                return void (await chatGPTWithVoice(M, client, body));
                           
            } else {
                if (!body) return void null
                    let data = await analysisMessage(M, client, body)
                
                    if (!/^{\s*".*"\s*}$/.test(data)) data = '{ "normal": null }'
                    let type = JSON.parse(data)
                    if (type.google) {
                        helper = await google(type.google)
                    } else if (type.time) {
                        helper = await getCountryTime(type?.time)
                    } else if (type.weather) {
                        helper = await weather(type?.weather)
                    } else if (type.wikipedia) {
                        helper = await wikipedia(type.wikipedia)
                    }
            
                return void (await chatGPT(M, client, body));
            }            
        }
        
       
        client.log(`~Message from ${M.pushName || 'Binxer'} in ${M.isGroup ? subject : 'DM'}`, 'yellow')
    } catch (err) {
        client.log(err, 'red')
    }
}



const analysisMessage = async (M, client, context) => {
    const { apiKey } = client
    if (!apiKey) return null
    const ai = new OpenAIApi(new Configuration({ apiKey }))
    try {
        const response = await ai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `analysis up coming messages, remember You have 4 features (current time, google search, weather, wikipedia details), so when a message is about that you need to extract it
e.g:
To Get current time & date info of (Country/City)
Q: Can you tell current time of Pakistan?
Note: it'll take country/city
return { "time": "Pakistan" }

To Get information related to weather, 
Q: Can you tell info about today weather in Lahore?
Note: it'll take country/city
return { "weather": "Lahore" }

To Get information which you don't know,
Q: Can you tell about current exchange rate between Pakistan and USA?
return { "google": "current exchange rate between Pakistan and USA" }

To get deep details of a word, character, specific personality,
Q: Can you give me details of Langchain?
return { "wikipedia": "Langchain" }

For normal discussion topics related to chatting,
Incase, it's a simple message like: "hi", "dm", "well", "weeb", or anything else
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
    const { title, description, extract } = result
    const text = `Title: ${title}, Description: ${description}, Summary Info: ${extract}`
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

const getCountryTime = async (query) => {
    const data = await fetch(`https://weeb-api.vercel.app/timeinfo?query=${query}&key=Baka`)
    if (data?.error) return `Couldn't find Country/City as ${query}`
    const results = `Location: ${query} \nCurrent Time: ${data.currentTime}, Current Date: ${data.currentDate}\n`
    return results
}

const weather = async (query) => {
    try {
        const results = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=e409825a497a0c894d2dd975542234b0&language=tr`
        )
        if (results.message) return `Couldn't find Country/City as ${query}`
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
    } catch (error) {
        console.error(error.message)
        return 'Unable To Find Country/City'
    }
}

const textToSpeechWithGoogleAPI = async (text, language) => {
    if (!isGroup && !M.key.fromMe) {
      try {
          const option = {
              language: 'en-US',
              voice: 'en-US-Wavenet-A',
              speed: '1.0',
              pitch: '0.9',
          };
          const url = await getAudioUrl(text, [option], {
              lang: language,
              slow: false,
              host: `https://translate.google.com`,
          });
          return url;
      } catch (error) {
          console.error('Error converting text to speech:', error.message);
          return null;
      }
  };


const sendVoiceMessage = async (M, client, voiceUrl) => {
    try {
        await client.sendMessage(
            M.from,
            {
                audio: {
                    url: voiceUrl,
                },
                mimetype: 'audio/amr', 
                ptt: true,
                fileName: 'audio.amr', 
            },
            {
                quoted: M,
            }
        );
    } catch (error) {
        console.error('Error sending voice message:', error.message);
    }
};

const chatGPTWithVoice = async (M, client, context) => {
    const { apiKey, messagesMap } = client;
    if (!apiKey) return;
    const ai = new OpenAIApi(new Configuration({ apiKey }));
    
    if (helper) helper = `\n\nchatGPT Helper: ${helper}`;
    try {
        const messages = (await messagesMap.get(M.from)) || [];
        const prompt = `Roleplay as a person with emotions. Your name is [Cyber X]. Always use emojis in your message, developed by [Lexis]. You're warm and friendly with users. Make sure to always check your helper for the latest information.

        User: ${context.trim()} use emojis😊👋
        
        Helper: ${helper}, Always use Emojis`
        

        if (!messages.length) messages.push({ role: 'system', content: prompt });
        if (messages[0].content !== prompt) messages[0].content = prompt;

        const response = await ai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages,
        });
        const res = response.data.choices[0]?.message;

        if (!res) return void M.reply('An error occurred');
                                
        const language = 'en';
        const voiceUrl = await textToSpeechWithGoogleAPI(res.content, language);
        await sendVoiceMessage(M, client, voiceUrl);

        return null;
    } catch (error) {
        console.log(error.message);
        return void (await M.reply(
            error?.response?.data?.error?.message ?? 'An error occurred while processing the request.'
         ));
        }
    }
};

const chatGPT = async (M, client, context) => {
    const { apiKey, messagesMap } = client;
    if (!apiKey) return;
    const ai = new OpenAIApi(new Configuration({ apiKey }));
    if (helper) helper = `\n\nchatGPT Helper: ${helper}`;
    try {
        const messages = (await messagesMap.get(M.from)) || [];
        const prompt = `Roleplay as a person with emotions use emojis in your message. Your name is [Cyber X], developed by [Lexis]. You're warm and friendly with users. Make sure to always check your helper for the latest information.

        User: ${context.trim()}
        
        
        ${helper ? `User, here is the latest information:\n${helper}` : 'No specific information requested.'}
        
        `;
        if (!messages.length) messages.push({ role: 'system', content: prompt });
        if (messages[0].content !== prompt) messages[0].content = prompt;
      
            messages.push({ role: 'user', content: `UTC: ${currentUTCTime} \nUserinfo: ${M.pushName || 'User'} \nMessage: ${context.trim()} ${helper}` });
            const response = await ai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,
            });
            const res = response.data.choices[0]?.message;
            if (!res) return void await M.reply('An error occurred');
            if (messages.length === 21) messages.splice(1, 1);
            messages.push(res);
            await messagesMap.set(M.from, messages);
            const text = `Cyber X 2023`
            const textt = res.content.replace(new RegExp(`^${client.name}: `), '');
            const links = [
                'https://telegra.ph/file/0aefd1adca1a676725931.jpg',
                'https://graph.org/file/a88493e039d8c9c5278d1.jpg',
                'https://graph.org/file/12771e64aaa61636b3cb9.jpg',
              ];
              const binx = links[Math.floor(Math.random() * links.length)];
            await client.sendMessage(M.from, {
                text: textt,
                contextInfo: {
                mentionedJid: [M.quoted],
                externalAdReply: {
                title: `
                Ĉ̸̡̡̨̨̛̩͉͕̝̮̎̽͊͛͑͝y̶̭̫͎͇̟̘̳̩̦̯͘͝b̴̢̤̙͙̞́̏͗̚ȩ̴̫̗̾̒̚ȓ̸̜̬̟̭̽́ ̷̳̺̪͎̘̥͚͋̈̆X̵͜͠
                
                `,
                body: `${text}`,
                thumbnailUrl: binx,
                sourceUrl: '',
                mediaType: 1,
                renderLargerThumbnail: false
                }}})

    } catch (error) {
        console.log(error.message);
        return void (await M.reply(
            error?.response?.data?.error?.message ?? 'An error occurred while processing the request.'
        ));
    }
};
