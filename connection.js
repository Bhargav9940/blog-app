    const mongoose = require("mongoose");

    let conn;
    let gfs;

    async function connectToMongoDB(url) {
        conn = await mongoose.connect(url);
        const db = mongoose.connection.db;
        gfs = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads',
        });
        console.log("GridFs initialized!");
        return conn;
    }

    async function loadImg(res, imgName) {
        const file = await gfs.find({ filename:imgName }).toArray();
        if(file) {
            const readstream = gfs.openDownloadStreamByName(file[0].filename)
            readstream.pipe(res);
        }
    }

    module.exports = {
        connectToMongoDB,
        loadImg,
    };
