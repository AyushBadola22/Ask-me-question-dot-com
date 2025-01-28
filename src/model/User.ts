import mongoose , {Schema , Document} from 'mongoose';

export interface Message extends Document {
    content : string ; 
    createdAt : Date ; 
}

const MessageSchema : Schema<Message>= new Schema({
    content : {
        type : String , 
        required : true 
    }, 
    createdAt : {
        type : Date , 
        default : Date.now , 
        required : true 
    }
}) ; 

export interface User extends Document { 
    username : string , 
    email : string , 
    password : string , 
    verifyCode : string , 
    verifyCodeExpiry : Date , 
    isAcceptingResponse : boolean , 
    isVerified : boolean ,
    messages : Message[] 
}; 

const UserSchema : Schema<User> = new Schema({
    username : {
        type : String , 
        required : [true, "Username is required"], 
        trim : true , 
    }, 
    email : {
        type : String , 
        required : true , 
        unique : true, 
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format given']
    }, 
    password : {
        type : String , 
        required : [true, "Password is required"]
    }, 
    verifyCode : {
        type : String , 
        required : [true, 'verification code required']
    }, 
    verifyCodeExpiry : {
        type : Date , 
        required : [true , 'verification code expriy date required']
    }, 
    isVerified : {
        type : Boolean , 
        default : false 
    },  
    isAcceptingResponse : {
        type : Boolean , 
        default : true 
    }, 
    messages : [MessageSchema]
});


export interface UserDocument   extends Document , User{}

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema); 
export default UserModel; 
