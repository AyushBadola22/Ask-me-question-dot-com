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
    } catch (error : any) {
        console.log(error.message);
        process.exit(1); 
    }
}

export default dbConnect; 