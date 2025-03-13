import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client with a conditional check
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

export async function POST(req: Request) {
  // Check if OpenAI client is initialized
  if (!openai) {
    console.error("OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.");
    return NextResponse.json(
      { error: "OpenAI API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const data = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Error processing audio" },
      { status: 500 }
    );
  }
}
