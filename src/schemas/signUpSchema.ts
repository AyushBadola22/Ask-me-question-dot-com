import {z} from 'zod'; 

export const userNameValidation = z
    .string()
    .min(3, 'UserName must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9]*$/, 'Username must contain only letters and numbers');

export const signUpSchema = z.object({
    username : userNameValidation ,
    email : z.string().email({message : "INvalid email"}), 
    password : z.string().min(8, 'Password must be at least character long')
})


