const axios = require("axios");
const api = axios.create({
    baseURL: "https://notify.eskiz.uz/api/",
    headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQwMzY2MjAsImlhdCI6MTc0MTQ0NDYyMCwicm9sZSI6InRlc3QiLCJzaWduIjoiZGI2OWZjNGE0ZDhiNzE5MWU4OWI0Y2FiZTEwNWIxMTExNDdmY2RhZDEyNjcwYjIyMzExNmM1YTllMmYzMTYwNCIsInN1YiI6IjEwMTQ0In0.qAfmW9sfZZsuJApDbejWUGsxAB8fdBHeZ-IbNc67Rz8`,
    },
});

async function sendSMS(tel, otp) {
    try {
        await api.post("message/sms/send", {
            mobile_phone: tel,
            message: `Bu Eskiz dan test`,
        });
        console.log("Xabar jonatildi", otp, "|", tel);
    } catch (error) {
        console.log("xato");
    }
}

module.exports = { sendSMS };
