# 🤖 Cloudflare AI Chatbot Agent

An AI-powered chatbot built with Cloudflare's platform, demonstrating AI agent capabilities with real-time chat, tool integration, and task scheduling.

[![View Live Demo](https://img.shields.io/badge/_View_Live_Demo-orange?style=for-the-badge)](https://cf_ai_chatbot_agent.kushalkrishnappa333.workers.dev/)

## Core Components

**1. LLM**: Cloudflare Workers AI (Llama 3.1 8B)

- Free tier: 10,000 requests/day
- Configured in `src/server.ts:36-38`

**2. Workflow/Coordination**: Durable Objects

- Stateful agent management with AIChatAgent
- Tool execution and confirmations
- Task scheduling (one-time, delayed, cron)

**3. User Input**: React Chat Interface (Cloudflare Pages)

- Real-time streaming responses
- Message history display
- Tool invocation UI

**4. Memory/State**: Durable Objects + SQLite

- Persistent conversation history
- State management across sessions
- Configured in `wrangler.jsonc:20-35`

## Quick Start

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Deploy (100% FREE - no API keys needed)
npm run deploy
```

After deployment, copy the URL from the terminal output and update the badge link above.

## Project Structure

```
src/
├── server.ts      # Chat agent (Durable Object + Workers AI)
├── tools.ts       # Tool definitions
├── app.tsx        # React chat interface
└── components/    # UI components

wrangler.jsonc     # Cloudflare configuration
PROMPTS.md        # AI prompts documentation
```

## Learn More

- [Cloudflare Agents Documentation](https://developers.cloudflare.com/agents/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)

---

**Repository**: `cf_ai_chatbot_agent` | **Built for**: Cloudflare AI Agents Assignment
