import {z} from 'zod'; 

export const  messageSchema = z.object({
    content : z
    .string()
    .trim() 
    .min(10, "Message at least have 10 characters")
    .max(300, "Content must not exceeed than 300 characters")
}); 