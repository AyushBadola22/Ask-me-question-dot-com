import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendverificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST (request : Request) {
    await dbConnect(); 


    try {
        const {username , email , password} = await request.json(); 
        
        const existingUserVerifiedUsername = await UserModel.findOne ({
            username , 
            isVerified : true
        }); 

        if(existingUserVerifiedUsername){
            return Response.json({
                success : false , 
                message : "Username already taken"  
            } , {
                status : 400
            }); 
        }

        const existingUserByEmail = await UserModel.findOne({email})


        const verifyCode = Math.floor(100000 + Math.random() * 800000).toString(); 

        console.log('sending request')

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success : false , 
                    message : "Email already registered"
                }, {status : 400})
            }
            else {
                const hashedPassword = await bcrypt.hash(password , 12); 
                existingUserByEmail.password = hashedPassword; 
                existingUserByEmail.verifyCode = verifyCode; 
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save(); 
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(password , 12 ); 
            const expiryDate = new Date(); 
            expiryDate.setHours(expiryDate.getHours() + 1); 

            const newUser = new UserModel({
                username , email , password : hashedPassword, verifyCode , 
                verifyCodeExpiry : expiryDate, 
                isVerified : false , 
                isAcceptingResponse : true , 
                messages : []
            }); 

            await newUser.save();
        }


        const response = await sendverificationEmail(email , username, verifyCode);
        console.log('verification code function called')
        
        if(!response.success){
            Response.json({
                success : false , 
                message : response.message
            }, {status : 500}) ;
        }
        console.log('verification code sent')

        return Response.json({
            success : true , 
            message : "User registered successfully. Please verify your email."
        }, {status : 201}) ;
        
    } catch (error) {
        console.error("Error in registering user", error);
        return Response.json({
            success : false , 
            message : "Error in registering user"
        }, {
            status : 500
        })
    }
}