import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function extractPromptFromImage(imageBase64: string): Promise<{ success: boolean; prompt?: string; error?: string }> {
  try {
    // Use vision model to analyze the image and extract prompt
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and generate a detailed AI art prompt that could recreate it. Focus on style, composition, lighting, mood, and artistic elements. Be specific and descriptive.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      max_tokens: 1500,
    });

    const prompt = completion.choices[0]?.message?.content;

    if (!prompt) {
      return { success: false, error: 'No prompt generated' };
    }

    return { success: true, prompt };
  } catch (error: any) {
    console.error('Groq prompt extraction error:', error);
    return { success: false, error: error.message };
  }
}

export async function enhancePrompt(userPrompt: string): Promise<{ success: boolean; prompt?: string; error?: string }> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI prompt engineer. Take the user\'s brief prompt and enhance it into a highly detailed, descriptive, and cinematic prompt for an AI image generator. Focus on lighting, composition, mood, and aesthetic. Do not include any conversational text, ONLY output the enhanced prompt.'
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      max_tokens: 800,
    });

    const prompt = completion.choices[0]?.message?.content;

    if (!prompt) {
      return { success: false, error: 'No prompt generated' };
    }

    return { success: true, prompt: prompt.trim() };
  } catch (error: any) {
    console.error('Groq prompt enhancement error:', error);
    return { success: false, error: error.message };
  }
}
