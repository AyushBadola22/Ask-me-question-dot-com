import mongoose from 'mongoose'; 

type ConnectionObject = {
    isConnected?: number 
};

const connection : ConnectionObject = {} ; 

async function dbConnect() : Promise<void> {
    if(connection.isConnected){
        console.log('already connected');
        return; 
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI_ONLINE ?? ''); 
        connection.isConnected = db.connections[0].readyState; 
    } catch (error : unknown) {
        const typedError = error as Error & { message: string };
        if(typedError.message)
            console.log(typedError.message);
        else 
            console.log("Error connecting database")
        process.exit(1); 
    }
}

export default dbConnect; 