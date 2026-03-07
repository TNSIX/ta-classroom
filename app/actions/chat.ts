'use server'

type ChatMessage = {
    role: 'user' | 'assistant' | 'system' | 'bot';
    content: string;
};

export async function sendChatMessage(messages: ChatMessage[], modelId: string = 'llama-3.3-70b-versatile') {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return { error: 'กรุณาตั้งค่า GROQ_API_KEY ในไฟล์ .env.local ก่อนเริ่มใช้งาน' };
    }

    // จัดรูปแบบ Message ให้ตรงกับ API ของ Groq / OpenAI
    const apiMessages = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : msg.role,
        content: msg.content
    }));

    // แทรก System Prompt เพื่อกำหนดบทบาทของบอตให้อยู่บรรทัดแรก
    apiMessages.unshift({
        role: 'system',
        content: 'คุณคือผู้ช่วย AI บริหารจัดการชั้นเรียน (TA Assistant) ชื่อ ADMIN สนทนาด้วยภาษาไทยอย่างสุภาพและเป็นกันเอง ช่วยเหลือทั้งครูผู้สอนและนักเรียนในการตอบคำถามในระบบ'
    });

    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelId,
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || 'Groq API error');
        }

        const data = await res.json();
        const reply = data.choices[0].message.content;

        return { content: reply as string };
    } catch (error: any) {
        console.error('Groq Error:', error);
        return { error: `เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI: ${error.message}` };
    }
}
