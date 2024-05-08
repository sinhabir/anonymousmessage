import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        console.log("Already connected to Database!!")
        return
    }

    //if Db is not connected
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '')
        connection.isConnected = db.connections[0].readyState
        
        console.log("DB Connected sucessfully")

    } catch (error) {
        console.log("Database Connection failed")
        process.exit(1) 
    }
}

export default dbConnect;