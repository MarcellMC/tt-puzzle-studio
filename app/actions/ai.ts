"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePuzzleMetadata(imageDataUrl: string) {
  try {
    // Validate that we have a data URL, not a blob URL
    if (!imageDataUrl.startsWith("data:image/")) {
      throw new Error("Invalid image format. Please provide a data URL.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and provide: 1) A catchy, fun title for a puzzle (max 60 chars), 2) An engaging description suitable for children (max 150 chars). Return as JSON with 'title' and 'description' fields.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    return {
      success: true,
      title: parsed.title || "Puzzle Challenge",
      description: parsed.description || "Complete this fun puzzle!",
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      title: "Puzzle Challenge",
      description: "Complete this fun puzzle!",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function enhancePuzzleDescription(
  imageUrl: string,
  currentTitle: string,
  currentDescription: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Given this image and current puzzle metadata (title: "${currentTitle}", description: "${currentDescription}"), suggest improvements or alternative versions. Return as JSON with 'suggestions' array containing objects with 'title' and 'description' fields (3 alternatives).`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    return {
      success: true,
      suggestions: parsed.suggestions || [],
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      suggestions: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
