FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/

# Copy Web package files
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Web source code
COPY apps/web/ ./apps/web/

# Build the application
RUN cd apps/web && pnpm build

EXPOSE 3000

CMD ["pnpm", "-F", "web", "start"]
