import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API ?? "");

export const runtime = "edge";


// TODO : I want to change it such that it fetches the messages to users and based on that ask something similar.


export async function POST(req: Request) {
  try {
    
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. Also do not repeat same questions.";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent(prompt);
    return NextResponse.json({
      success: true,
      questions: response.response.text(),
    });

  } catch (error: any) {
    if (error.name && error.status) {
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.status }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return NextResponse.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}
