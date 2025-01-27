import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";


export async function sendverificationEmail(
    email : string , username : string, verifyCode : string
) : Promise<ApiResponse>{
    try {
        const {data , error} = await resend.emails.send({
            from : "onboarding@resend.dev", 
            to : email, 
            subject : "Verification Code", 
            react : VerificationEmail({username , otp : verifyCode} ) 
        });

        
        if(error){
            throw new Error(error.message || "Error while sending verification email"); 
        }

        return {
            success : true , 
            message : "Verification code sent successfully."
        }
        
    } catch (error) {
        console.error("Error sending verification code", error);

        return {
            success : false , message : "Failed to send verification email"
        }; 
    }
}



