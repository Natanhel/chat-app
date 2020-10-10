 const generateMessage = (username, text) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
 }

 const generateLocationMessage = (username, coords) => {
    return {
        url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        createdAt: new Date().getTime(),
        username
    }
 }

module.exports = {
    generateMessage,
    generateLocationMessage
}