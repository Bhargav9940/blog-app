const JWT = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET_KEY;

function createToken(user) {
    const payload = {
        fullName: user.fullName,
        _id: user._id,
        email: user.email,
        role: user.role,
    };

    const token = JWT.sign(payload, secret);
    return token;
}

function validateToken(token) {
    const payload = JWT.verify(token, secret);
    return payload;
} 

module.exports = {
    createToken,
    validateToken,
};