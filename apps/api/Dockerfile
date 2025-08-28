FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/

# Copy API package files
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api/ ./apps/api/

# Copy prisma schema
COPY apps/api/prisma/ ./apps/api/prisma/

# Generate Prisma client
RUN cd apps/api && pnpm db:generate

# Build the application
RUN cd apps/api && pnpm build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["pnpm", "-F", "api", "start:prod"]
