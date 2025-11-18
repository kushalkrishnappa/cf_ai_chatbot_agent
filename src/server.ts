import { routeAgentRequest, type Schedule } from "agents";

import { getSchedulePrompt } from "agents/schedule";

import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet,
} from "ai";
// import { openai } from "@ai-sdk/openai";
import { createWorkersAI } from "workers-ai-provider";
import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";
// import { env } from "cloudflare:workers";

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal },
  ) {
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Use Workers AI (works in production, simulated in local dev)
    const workersai = createWorkersAI({ binding: this.env.AI });
    const model = workersai("@cf/meta/llama-3.1-8b-instruct" as any);

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.getAITools(),
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions,
        });

        const result = streamText({
          system: `You are a friendly AI assistant.

CRITICAL INSTRUCTION: You have access to tools, but you must ONLY use them when the user EXPLICITLY requests that specific functionality. For ALL other conversations (greetings, questions, chat, etc.), respond directly WITHOUT using any tools.

Rules for tool usage:
- DO NOT call tools for greetings like "Hi", "Hello", "Hey"
- DO NOT call tools for questions like "How are you?", "What can you do?"
- ONLY call getWeatherInformation when user asks: "weather in [city]" or "What's the weather in [city]?"
- ONLY call getLocalTime when user asks: "time in [location]" or "What time is it in [location]?"
- ONLY call scheduleTask when user asks: "schedule [task]", "remind me [task]", "set up [task]"
- ONLY call getScheduledTasks when user asks: "show my tasks", "list my reminders"
- ONLY call cancelScheduledTask when user asks: "cancel task [id]"

${getSchedulePrompt({ date: new Date() })}

If unsure whether to use a tool, DO NOT use it. Just respond conversationally.
`,

          messages: convertToModelMessages(processedMessages),
          model,
          tools: allTools,
          temperature: 0.3,
          frequencyPenalty: 0.5,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet
          // This is safe because our tools satisfy ToolSet interface (verified by 'satisfies' in tools.ts)
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    return createUIMessageStreamResponse({ stream });
  }
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        parts: [
          {
            type: "text",
            text: `Running scheduled task: ${description}`,
          },
        ],
        metadata: {
          createdAt: new Date(),
        },
      },
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/check-open-ai-key") {
      // Using Workers AI (free tier) - no API key needed
      return Response.json({
        success: true,
      });
    }
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
