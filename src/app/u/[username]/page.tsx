'use client'

import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { messageSchema } from '@/schemas/messageSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'
import { useParams } from 'next/navigation'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Separator } from '@radix-ui/react-separator'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'


const defaultQuestions = "What's a skill you'd love to learn, and why?||If you could travel anywhere in the world right now, where would you go and what would you do?||What's a piece of advice you wish you'd received earlier in life?\n"




export default function PublicPage() {

  const [isAcceptingMessages, setIsAcceptingMessages] = useState(false);
  const [suggestedQuestions , setSuggestedQuestions] = useState(defaultQuestions); 
  const [loadingQuestions , setLoadingQuestions] = useState(false);
  const [username , setUsername] = useState(''); 
  const form  = useForm<z.infer<typeof messageSchema>>({
    defaultValues : {
      content : ""
    }, 
    resolver : zodResolver(messageSchema)
  })

  const params = useParams<{username : string}>();     


  const onsubmit = async (message : z.infer<typeof messageSchema>) => {
    try {
      const response = await axios.post<ApiResponse>('/api/send-messages' , {username , content : message.content})
      if(response.data.success){
        toast({
          title : "Message sent", 
          description : "Your message has been sent successfully, you can send another response.",
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>; 
      toast({
        title : "Error occured", 
        description : axiosError.response?.data.message ?? "Failed to send message"
      })
    }
    finally{
      form.reset(); 
    }
  }

  const handleCopy = async (question : string) => {
    navigator.clipboard.writeText(question);
    toast({
      title : "Copied to clipboard",
      description : "Question copied to clipboard",
      variant : "default"
    })
  }
    
    
    useEffect(()=> {
      const fetchAcceptMessages = async()=>{
       
        try {
          setUsername(params.username ?? ''); 
          const response = await axios.get<ApiResponse>(`/api/accept-messages?username=${params.username}` ); 
          setIsAcceptingMessages(response.data.isAcceptingMessage ?? false);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>; 
          toast({
            title : "Error occured", 
            description : axiosError.response?.data.message ?? "Failed to fetch message settings",
            variant : "destructive"
          })
        }
        
      }
      fetchAcceptMessages(); 
    }, [] )



  const handleSuggestionsClick = async ()=>{
    setLoadingQuestions(true);
    try {
      const response = await axios.post('/api/suggest-messages'); 
      if(response.data.success){
        setSuggestedQuestions(response.data.questions);
        toast({
          title : "Questions updated"
        })
      }
      else{
        console.log("error  aa gya mamu")
      }
      console.log(suggestedQuestions);
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      setSuggestedQuestions(defaultQuestions);  
      toast({
        title : "Error occured", 
        description : axiosError.response?.data.message ?? "Failed to fetch message settings",
        variant : "destructive"
      })
    }
    finally{
      setLoadingQuestions(false);
    }
  }

  return ( 
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4 w-full text-center ">Public Profile link</h1>
      {!isAcceptingMessages ?
      <div className='w-full flex items-center justify-center flex-col'>
        <span className="mt-6 text-center font-bold text-md">@{username} is not accepting messages anymore</span>
      </div>
        
        :
      <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)}    >
          <FormField 
            control={form.control}
            name = 'content'
            render={({field}) => {
              return <div>
                <FormItem>
                  <FormLabel className="font-bold">Send Anonymous Question to @{username}</FormLabel>
                  <textarea
                      placeholder="Type your message..."
                      {...field}
                      className="w-full p-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-black focus:ring-1  focus:black focus:border-black resize-none h-32 "
                      />
                  <FormMessage />
                </FormItem>
              </div>
            }}
            />
          <Button className='mt-4 px-3 py-2 font-bold bg-black text-white' type="submit">Send your question</Button>
        </form>
       </FormProvider>

       <Separator className="my-4 h-0.5 bg-gray-300" />


      <Card className='mt-8'>   
        {
          loadingQuestions ? <div className='bg-gray-100 w-full h-60 flex items-center justify-center'><Loader2 className='animate-spin'/></div> : 
          
          <CardContent className=''>
        {
          suggestedQuestions.split('||').map((question : string, index : number)=> {
            return <Card key={index} className='mt-4 ml-6 mr-6'>
            <CardContent className='text-left p-4'>
              <button onClick={()=> handleCopy(question)}  
                className='text-left'>
                {question}
              </button>
            </CardContent>
          </Card>
          })
        }    
        </CardContent>}
      </Card>
       
      <button className={`mt-4 bg-primary text-primary-foreground text-sm hover:bg-primary/90 h-10 font-bold px-3 py-2 rounded-lg`} 
      disabled = {loadingQuestions} 
      onClick={handleSuggestionsClick}
      >
        {loadingQuestions ? <Loader2 className='animate-spin'/> : "Suggest me more questions"}
      </button>
       
    </>
    }
    <p className="mt-4">
        <Link className='text-blue-600 hover:opacity-70 font-bold' href={'/'}>Explore home page</Link>
        </p>
    </div>
  )
}


