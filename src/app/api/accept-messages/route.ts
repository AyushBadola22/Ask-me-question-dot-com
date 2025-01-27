import { getServerSession , User} from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";;



export async function POST (request : Request) {
    await dbConnect(); 

    const session = await getServerSession(authOptions); 
    const user : User = session?.user as User;
    
    if(!session || !user) {
        return Response.json(
            {
                success : false , 
                message : "Not authenticated"
            }, {status : 401}
        );
    }
    
    const userID = user._id; 
    const {acceptMessages } = await request.json()
    
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userID , {
            isAcceptingResponse : acceptMessages
        }, {new : true})


        if(!updatedUser){
            return Response.json({
                success : false , 
                message : "failed to update user status"
            }, {status : 401})
        }
        return Response.json({
            success : true , 
            message : "User status has been updated", 
            updatedUser
        })
    } catch (error) {
        console.error(error);
        return Response.json({
            success : false , 
            message : "Failed to update user status"
        }, {status : 500}); 
    }
}

export async function GET (request : Request){
    await dbConnect(); 

    const session = await getServerSession(authOptions); 
    const user : User = session?.user as User;  
    const username = new URL(request.url).searchParams.get('username');

    
    if ((!session || !user) && !username) {
        return Response.json({
                success: false,
                message: "Cannot get user status"
            }, { status: 401 });
    }
    
    let foundUser;

    if (user) {
        const userID = user._id;
        foundUser = await UserModel.findById(userID);
    } else if (username) {
        foundUser = await UserModel.findOne({ username: username });
    }

    try {
        if(!foundUser){
            return Response.json({
                success : false , 
                message : "User not found"
            }, {status : 404})
        }
    
        return Response.json({
            success : true , 
            isAcceptingMessage : foundUser.isAcceptingResponse
        })
    } catch (error) {
        console.error(error);
        return Response.json({
            success : false , 
            message : "Error in getting message access"
        }, {status : 500}); 
    }
}