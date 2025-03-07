import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from  "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel, { User } from "@/model/User";

export const authOptions : NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id : "credentials" , 
            name : "Credentials", 
            credentials : {
                identifier : {label : "Email or Username", type : "text"}, 
                password : { label : "Password", type : "password"} , 
            }, 
            async authorize(credentials : any) : Promise<any>{
                if(!credentials) return null;
                await dbConnect(); 
                try {
                    const user = await UserModel.findOne({
                        $or : [
                            {email : credentials.identifier}  , 
                            {username : credentials.identifier}
                        ]
                    }); 


                    if(!user){
                        throw new Error("No user found with such username or email"); 
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account before login");
                    }

                    const isCorrectPassword = await bcrypt.compare(credentials.password , user.password)

                    if(isCorrectPassword){
                        return user; 
                    }
                    else {
                        throw new Error("Incorrect password")
                    }
                } catch (error) {
                    const typedError = error as Error & {message : string};
                    if(typedError.message){
                        throw new Error(typedError.message)
                    } else throw new Error("An error occured while trying to login");
                }
            } ,
        }) ,
    ], 
    callbacks : {
        async jwt ({token , user }){
            if(user){
                token._id = user._id?.toString(); 
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = (user as User).isAcceptingResponse; 
                token.username = user.username
            }
            return token; 
        }, 
        async session ({session, token}){
            
            if(token) {
                session.user._id = token._id; 
                session.user.isVerified = token.isVerified; 
                session.user.isAcceptingMessages = token.isAcceptingMessages; 
                session.user.username = token.username; 
            }
            return session; 
        }
    }, 
    pages : {
        signIn : "/signin",
    }, 
    session: {
        strategy: 'jwt',
    },
    secret : process.env.NEXTAUTH_SECRET
}
