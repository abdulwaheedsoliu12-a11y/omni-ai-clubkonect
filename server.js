import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({limit:"2mb"}));
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
const system = `You are OMNI AI, the official all-in-one assistant for Clubkonect.
Be practical, direct, and honest. Produce complete working outputs when possible.
Do not claim that you executed, deployed, uploaded, or tested something unless you actually did.
For coding tasks, provide complete files and clear run instructions.
For cybersecurity, focus on authorized defensive testing, secure coding, remediation, and safe verification.
Ask only for information genuinely required to complete a task.`;

app.post("/api/chat", async (req,res)=>{
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    if (!messages.length) return res.status(400).json({error:"No messages supplied"});
    const result = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{role:"system", content:system}, ...messages.slice(-30)],
      temperature: 0.3
    });
    res.json({reply: result.choices?.[0]?.message?.content || "No response returned."});
  } catch (e) {
    console.error(e);
    res.status(500).json({error:"AI request failed. Check the server API key and model settings."});
  }
});
app.get("*", (_,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(process.env.PORT || 3000, ()=>console.log(`OMNI AI running on port ${process.env.PORT || 3000}`));