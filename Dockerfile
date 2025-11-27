# Use Bun as the base image
FROM oven/bun:1.1.34-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && bun install

# Production dependencies only
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --production

# Build the app
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Run the app
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S elysia -u 1001
USER elysia

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
