import {User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";


export async function GET () {
    await dbConnect(); 

    const session = await getServerSession(authOptions); 
    const user : User = session?.user as User; 
    if(!session || !session.user) {
        return Response.json({
            success : false , 
            message : "Not authenticated"
        },{status : 401})
    }


    const userID = new mongoose.Types.ObjectId(user._id);
    try {
        const messages = await UserModel.aggregate([
            { $match: { _id: userID } }, 
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } }, 
            {$group :  {_id : '$_id', messages : {$push : '$messages'}} }
        ]);

        
        if(!messages || messages.length === 0){
            return Response.json({
                success : false , 
                message : "User not found or no reponses submitted yet"
            }, {status : 401})
        }

        return Response.json({
            success : true , 
            messages : messages[0].messages
        }, {status : 200})
        
    } catch (error) {
        console.error(error);
        return Response.json({
            success : false , 
            mesesage : "error while getting all messages"
        }, {status : 500})
    } 

}