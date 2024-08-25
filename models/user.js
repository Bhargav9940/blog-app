const { Schema ,  model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createToken } = require("../services/authentication");

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        salt: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        profileImageURL: {
            type: String,
            default: "/images/default.png",
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER",
        },
    },
    { timestamps: true }
);

//password Hashing
//Don't use arrow function here
userSchema.pre("save", function (next) {
    const user = this;

    if(!user.isModified("password")) return;

    //salt is a random string---- 16 digit secret key
    const salt = randomBytes(16).toString();

    //creatting hashed password
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
    next();
});


//to define function for User model
//function can be used on User model
userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {
    const user = await this.findOne({email});
    if(!user) throw new Error('User not found!');
    const salt = user.salt;
    const hashedPassword = user.password;
    const hashOfProvidedPwd = createHmac("sha256", salt).update(password).digest("hex");
    
    if(hashedPassword !== hashOfProvidedPwd)
        throw new Error("Incorrect Password!");
    
    const token = createToken(user);
    return token;
});

//above function matchPassword can be directly used on model's instance

const User = model("user", userSchema);

module.exports = User;


//About .digest()
// .digest Method: After feeding data into a hashing function (such as using the update method), .digest is called to produce the final hash value. This method returns the digest as a byte string.

// The .digest("hex") method is crucial to the final step in the HMAC (Hash-based Message Authentication Code) process.


// Explanation of Each Part:
// const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

// createHmac("sha256", salt):

// This creates an HMAC object using the SHA-256 hashing algorithm and a salt.
// HMAC is a specific type of cryptographic function that combines a key (in this case, the salt) with the message (the password) to produce a hash. It's used for both data integrity and authenticity.
// .update(user.password):

// The update() method feeds the user.password into the HMAC object. You can call update() multiple times if you have large amounts of data that need to be hashed in chunks.
// .digest("hex"):

// The digest() method finalizes the HMAC process and returns the resulting hash.
// The argument "hex" specifies that the output should be in hexadecimal format, which is a common way to represent hash values as a string.
// If you didn't specify "hex", .digest() would return a Buffer containing the raw bytes of the hash.

// Why .digest("hex") is Used:
// Finalization: .digest() completes the hashing process. Until you call .digest(), the HMAC object can still be updated with more data. Once .digest() is called, no further updates can be made to the hash object, and the hash is computed.

// Output Format: "hex" is used to convert the raw binary data of the hash into a readable hexadecimal string. This makes it easier to store or compare hash values, as they are now represented as a string of characters instead of raw bytes.

