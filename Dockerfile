FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_PUBLIC_SUPABASE_URL=https://rmobqopitkjobcnyqzru.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MDM3NzYsImV4cCI6MjEwMDk3OTc3Nn0.02MYe-jtAQDgM8zf7ntdTIuJ5nG05hogvJDZtBqKOEA
ENV NEXT_PUBLIC_R2_PUBLIC_URL=https://doc.ssczone.com

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=https://rmobqopitkjobcnyqzru.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MDM3NzYsImV4cCI6MjEwMDk3OTc3Nn0.02MYe-jtAQDgM8zf7ntdTIuJ5nG05hogvJDZtBqKOEA
ENV NEXT_PUBLIC_R2_PUBLIC_URL=https://doc.ssczone.com

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
