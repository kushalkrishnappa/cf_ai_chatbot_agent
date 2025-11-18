# Cloudflare AI Chatbot Agent

An AI-powered chatbot built with Cloudflare's platform, demonstrating AI agent capabilities with real-time chat, tool integration, and task scheduling.

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

Your app will be live at a `*.workers.dev` URL.

## Project Structure

```
cf_ai_chatbot_agent/
├── src/
│   ├── app.tsx                 # Main React chat interface
│   ├── server.ts              # Chat agent implementation (Durable Object)
│   ├── tools.ts               # Tool definitions and executions
│   ├── utils.ts               # Helper functions for message processing
│   ├── client.tsx             # React entry point
│   ├── styles.css             # Global styles
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   └── providers/             # React context providers
├── public/                    # Static assets
├── tests/                     # Test files
├── wrangler.jsonc            # Cloudflare Workers configuration
├── package.json              # Project dependencies
├── vite.config.ts            # Vite build configuration
├── tsconfig.json             # TypeScript configuration
├── .dev.vars                 # Local environment variables (create this)
├── PROMPTS.md               # AI prompts documentation
└── README.md                # This file
```

## Configuration

### Using Cloudflare Workers AI

To use Cloudflare Workers AI instead of OpenAI:

1. Install the Workers AI provider:

```bash
npm install workers-ai-provider
```

2. Update `src/server.ts`:

```typescript
// Replace OpenAI import
import { createWorkersAI } from "workers-ai-provider";

// In the Chat class
const workersai = createWorkersAI({ binding: env.AI });
const model = workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast");
```

The `ai` binding is already configured in `wrangler.jsonc`.

### Adding Custom Tools

Tools are defined in `src/tools.ts`. There are two types:

**1. Auto-executing tools** (no user confirmation):

```typescript
const myTool = tool({
  description: "Description of what the tool does",
  inputSchema: z.object({
    param: z.string(),
  }),
  execute: async ({ param }) => {
    // Implementation
    return "result";
  },
});
```

**2. Tools requiring confirmation**:

```typescript
// In tools definition
const myConfirmationTool = tool({
  description: "Description of what the tool does",
  inputSchema: z.object({
    param: z.string(),
  }),
  // No execute function
});

// In executions object
export const executions = {
  myConfirmationTool: async ({ param }: { param: string }) => {
    // Implementation after user confirms
    return "result";
  },
};
```

Don't forget to add confirmation-required tools to `toolsRequiringConfirmation` in `src/app.tsx`.

## Customization

### Modifying the UI Theme

Edit colors in `src/styles.css`:

```css
:root {
  --primary: your-color;
  --secondary: your-color;
  /* ... other variables */
}
```

### Changing the System Prompt

Update the system prompt in `src/server.ts` line 64-68 to customize the agent's behavior.

### Adding New UI Components

The project uses:

- **Tailwind CSS** for styling
- **Radix UI** for accessible primitives
- **Phosphor Icons** for icons
- **React Markdown** for message formatting

## Use Cases

This chatbot can be customized for various use cases:

- **Customer Support**: Add tools for ticket management, order tracking
- **Development Assistant**: Integrate code linting, git operations, documentation search
- **Personal Productivity**: Task management, calendar integration, note-taking
- **Data Analysis**: Database querying, visualization, report generation
- **Scheduling Assistant**: Event management, reminders, recurring tasks

## 🧪 Testing

Run tests:

```bash
npm test
```

Type checking:

```bash
npm run check
```

Format code:

```bash
npm run format
```

## Learn More

- [Cloudflare Agents Documentation](https://developers.cloudflare.com/agents/)
- [Agents SDK on npm](https://www.npmjs.com/package/agents)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [AI SDK Documentation](https://sdk.vercel.ai/docs/introduction)

## Security Considerations

- Never commit API keys or secrets to version control
- Use Wrangler secrets for production environment variables
- Implement rate limiting for production deployments
- Review and validate all tool executions, especially those that modify data
- Use human-in-the-loop confirmations for sensitive operations

## Contributing

This project is built for educational and demonstration purposes. Feel free to fork and customize for your needs.

## 📝 License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [Cloudflare Agents SDK](https://github.com/cloudflare/agents)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Phosphor Icons](https://phosphoricons.com/)

---

**Repository Prefix**: `cf_ai`
**Built for**: Cloudflare AI Agents Assignment
