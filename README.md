# me.ai - Your AI-Powered Workspace

A Notion-like workspace with mathematical rendering, tables, flowcharts, and AI integration built with Next.js, ShadCn, Daisy UI, Google Gemini AI, and Supabase.

## Features

- 📝 Block-based editing with support for:
  - Text blocks
  - Mathematical equations (LaTeX)
  - Tables
  - Flowcharts
- 🤖 AI-powered suggestions and improvements using Google Gemini
- 🔐 User authentication with Supabase
- 📱 Responsive design with a collapsible sidebar
- 🎨 Clean and modern UI using ShadCn and Daisy UI

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/me.ai.git
   cd me.ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/         # React components
│   ├── editor/        # Editor-related components
│   └── ai/            # AI integration components
├── lib/               # Utility functions and configurations
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [ShadCn](https://ui.shadcn.com/)
- [Daisy UI](https://daisyui.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Supabase](https://supabase.com/)
