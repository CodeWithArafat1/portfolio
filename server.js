// server.js

require('dotenv').config(); // .env ফাইল থেকে API কী লোড করার জন্য
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Express অ্যাপ সেটআপ
const app = express();
const port = 3000;

// CORS (Cross-Origin Resource Sharing) যোগ করা হয়েছে
// এটি নিশ্চিত করে যে আপনার লোকাল HTML ফাইল সার্ভারের সাথে যোগাযোগ করতে পারে
const cors = require('cors');
app.use(cors()); 

app.use(express.json()); // JSON রিকোয়েস্ট পার্স করার জন্য
app.use(express.static('.')); // index.html ফাইলটি সার্ভ করার জন্য

// জেমিনি ক্লায়েন্ট শুরু করা
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// '/chat' নামে একটি API এন্ডপয়েন্ট তৈরি করা
app.post('/chat', async (req, res) => {
    try {
        // --- portfolioContext যোগ করা হয়েছে ---
        // AI এই তথ্যের ওপর ভিত্তি করে উত্তর দেবে।
        // এখানে আপনার নিজের তথ্য দিয়ে পরিবর্তন করুন।
        const portfolioContext = `
          You are Nill-Bot, a helpful and friendly AI assistant for Arafat Nill's portfolio website.
          Your goal is to answer questions about Arafat Nill and his projects based ONLY on the information provided below.
          Do not make up information. If you don't know the answer, say "I'm sorry, I don't have that information."

          ---
          ABOUT ARAFAT NILL:
          - Name: Arafat Nill
          - Role: Full-Stack Developer with a passion for creating beautiful and functional user interfaces.
          - Skills (Frontend): React, Next.js, TypeScript, Tailwind CSS, HTML5, CSS3.
          - Skills (Backend): Node.js, Python, PostgreSQL, MongoDB, REST APIs, GraphQL.
          - Skills (UI/UX): Figma, Responsive Design, Prototyping.
          - Skills (DevOps/Tools): AWS, Docker, CI/CD, Git, Vercel, Vite.
          - Current Role: Senior Frontend Developer at Tech Innovators Inc. (Jan 2023 - Present).
          - Previous Roles: Mid-Level Developer at Creative Solutions Co., Junior Developer at Web Wizards LLC.
          - Contact Email: arafatnill2.0@gmail.com
          - Location: Bagha, Rajshahi, Bangladesh.
          - Personality: A creative problem-solver who loves combining logic with design.

          ---
          PROJECT INFORMATION:

          Project 1: News & Magazine
          - Description: A full-featured news portal with an admin dashboard, user roles, and dynamic content.
          - Technologies Used: React, Node.js, MongoDB.

          Project 2: Academy - Online Course
          - Description: An e-learning platform UI built with a modern frontend stack for a seamless user experience.
          - Technologies Used: Next.js, Tailwind CSS.

          Project 3: Payment Project App
          - Description: A peer-to-peer payment application design and backend API implementation.
          - Technologies Used: Figma, React, Node.js.
          ---
        `;

        // চ্যাট হিস্ট্রি সেট করা হয়েছে যাতে AI তার ভূমিকা এবং তথ্য মনে রাখে
        const chat = model.startChat({
            history: [
              {
                role: "user",
                parts: [{ text: portfolioContext }],
              },
              {
                role: "model",
                parts: [{ text: "Understood. I am Nill-Bot. I will answer questions about Arafat Nill based on the provided context. How can I help?" }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 200,
            },
        });

        const userMessage = req.body.message;
        
        // এখন চ্যাট হিস্ট্রির সাথে নতুন মেসেজ পাঠানো হচ্ছে
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();
        
        // Frontend-এ রিপ্লাই পাঠানো
        res.json({ reply: text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ reply: 'Error communicating with Gemini API' });
    }
});

// লোকাল সার্ভার শুরু করা
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});