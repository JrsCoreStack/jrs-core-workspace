# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.13.0
FROM public.ecr.aws/v4i6x4l6/node:${NODE_VERSION}-slim AS base

# NestJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    pkg-config \
    python-is-python3 \
    curl

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY --link . .

# Build the application
RUN npm run build

# Final stage for app image
FROM base

# Install Curl
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl


# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 8081
CMD [ "npm", "run", "start" ]