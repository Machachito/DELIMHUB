
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Task, TaskStatus } from "../types";

export const generateAIReport = async (project: Project, tasks: Task[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    review: tasks.filter(t => t.status === TaskStatus.REVIEW).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
  };

  const prompt = `
    Generate a professional project management report for the following project:
    Project Name: ${project.name}
    Description: ${project.description}
    Created At: ${project.createdAt}

    Current Stats:
    - Total Tasks: ${stats.total}
    - Tasks Done: ${stats.done}
    - Tasks In Progress: ${stats.inProgress}
    - Tasks in Review: ${stats.review}
    - Tasks Pending: ${stats.todo}

    Analyze this data and provide:
    1. A summary of current progress.
    2. Identification of potential bottlenecks.
    3. Recommendations for the project manager.
    4. An overall health score (0-100).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            bottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            healthScore: { type: Type.NUMBER },
            completionEstimate: { type: Type.STRING }
          },
          required: ["summary", "bottlenecks", "recommendations", "healthScore"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Report Generation Error:", error);
    throw error;
  }
};
