import dbConnect from "@/lib/dbConnect";
import UserModel , {Message} from "@/model/User";

export async function POST(request:Request) {
    await dbConnect(); 

    const {username , content} = await request.json(); 
    

    try {
        const user  = await UserModel.findOne({username} ) 
        
        if(!user){
            return Response.json({
                success : false , 
                message : "User not found"
            },{status : 404})
        }

        if(!user.isAcceptingResponse){
            return Response.json({
                success : false , 
                message : "User is not accepting any more response"
            }, {status : 401}) 
        }


        const newMessage = {content , createdAt : new Date()}

        user.messages.push(newMessage as Message)
        await user.save(); 

        return Response.json({
            success : true , 
            messages : "message send successfully"
        }, {status : 200})
    } catch (error) {
        console.error("Unexpected error : ", error);
        
        return Response.json({
            success : false , 
            messages : "Internal server error"
        }, {status : 501})
    }
}