/*
NOTES
1. Go to mongoDB website
2. Create a free Cluster
3. Create a User
4. Get the connection String
5. Install MongoDB Compass
6. Connect to cluser by add new connection and enter connection string
7. Install mongodb package to connect server to db
*/

const mongoose = require('mongoose');

// cluster (.net) + db (tenderGO)
// const cluster(URI/ConnectionString) = "mongodb+srv://dev-gaurav:DfLrhfucRBY8ZdnL@dev-gaurav.prubh7t.mongodb.net/"
const DB_URL = "mongodb+srv://dev-gaurav:DfLrhfucRBY8ZdnL@dev-gaurav.prubh7t.mongodb.net/tinderGO"

const connectDB = async() => {
    await mongoose.connect(DB_URL)
}

module.exports = connectDB;