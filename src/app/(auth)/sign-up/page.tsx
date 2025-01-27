'use client'


import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react"; 
import {useDebounceCallback} from 'usehooks-ts'; 
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const page = () => {
    const [username , setUsername] = useState('');
    const [usernameMessage , setUsernameMessage] = useState('');
    const [isCheckingUsername , setIsCheckingUsername] = useState(false);
    const [isSubmitting , setIsSubmitting] = useState(false); 
    const [isUnique , setIsUnique] = useState(false); 

    const debounced = useDebounceCallback(setUsername , 2000);   
    const {toast} = useToast(); 
    const router = useRouter();

    const form  = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues:{
            username: "", 
            email : "", 
            password : ""
        }
    }) 


    useEffect(()=>{
        const checkUsernameUnique = async ()=>{
            setIsUnique(false); 
            if(username ){
                setIsCheckingUsername(true); 
                setUsernameMessage(''); 
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    setUsernameMessage(response.data.message);
                    if(response.data.success) setIsUnique(true); 

                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? 'Error checking username'
                    );
                    
                } finally {
                    setIsCheckingUsername(false); 
                }
            }
        }


        checkUsernameUnique(); 
    }, [username])
    


    const onSubmit = async (data : z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true); 
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data );
            
            if(response.data.success){
                toast({
                    title : 'Success', 
                    description : response.data.message
                })
                router.replace(`/verify/${username}`)
            } else throw new Error(response.data.message); 

            setIsSubmitting(false); 
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>; 
            setUsernameMessage(axiosError.response?.data.message ?? 'Error checking username, make sure you only enter letters and characters');
            console.error("error in signup user", error); 
            toast({
                title : 'Error', 
                description : 'An error occurred', 
                variant : "destructive"
            })
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    Ask Me Question
                </h1>
                <p className="mb-4">Sign up to start your anonymous adventure</p>
            </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* username */}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="write username" {...field} 
                                    onChange={(e)=> {
                                        e.target.value = e.target.value.trim()
                                        field.onChange(e)
                                        debounced(e.target.value)
                                    }}
                                    />
                                </FormControl>
                                {
                                  isCheckingUsername && <Loader2 className="animate-spin"/>
                                }

                                <p className={`text-sm ${isUnique ? 'text-green-500' : 'text-red-600'}`}>{usernameMessage}</p>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        {/* email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="write email" {...field} type="email" 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        {/* password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="password" {...field}  type="password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        {/* sign in button */}
                        <div className="w-full flex items-center justify-center">
                            <Button type="submit" disabled={isSubmitting}>
                                {
                                    isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                            <span>Please wait</span>
                                        </div>
                                    ) : ('Sign up')
                                }
                            </Button>
                        </div>
                    </form>
                </Form>


                <div className="text-center">
                    <p>
                        Already a member?{' '}
                        <Link href={'/sign-in'} className="text-blue-600 hover:text-blue-800"> Sign in 
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default page;
