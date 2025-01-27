import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request:Request) {
    await dbConnect() ;
    
    try {
        const {username , code} = await request.json();
        const decodedUserName = decodeURIComponent(username); 

        const user = await UserModel.findOne({username : decodedUserName});
        
        if(!user){
            return Response.json ({
                success : false , 
                message : "user not found"
            })
        }

        const isCodeValid = user.verifyCode == code; 
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true; 
            await user.save(); 

            return Response.json ({
                success : true , 
                message : "Account verified successfully"
            })
        }
        else {
            if(!isCodeNotExpired)
                return Response.json ({
                success : false , 
                message : "Your code has expired, get a new one"
                })
            else 
                return Response.json ({
                    success : false , 
                    message : "Incorrect verification code"
                })
        }
        
    } catch (error) {
        console.error("Error while verifying code", error);
        return Response.json ({
            success : false , 
            message : "error while verifying code"
        })
    }
}