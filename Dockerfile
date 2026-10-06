#syntax=docker/dockerfile:1.7-labs
# Command line arguments, such as Node version
ARG NODE_VERSION=26
ARG PNPM_VERSION=11.6.0
#
# --- Stage 1: Build ---
#

FROM node:${NODE_VERSION} AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app
COPY --parents \
  package.json \
  pnpm-*.yaml \
  .npmrc \
  apps/*/package.json \
  apps/*/tsconfig.json \
  packages/**/package.json \
  packages/**/tsconfig.json ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --link-workspace-packages

#
# --- Stage: build-web ---
#
FROM build AS build-web
COPY . .
RUN pnpm --filter web run production

#
# --- Stage: build-api ---
#
FROM build AS build-api
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm --filter api type-check \
  && pnpm --filter api build \
  && pnpm --filter api post-build \
  && pnpm --filter api deploy --prod --legacy /out

#
# --- Stage: web ---
#
FROM ghcr.io/wisemen-digital/web-base:latest AS web

COPY --from=build-web /app/apps/web/dist /app/www
COPY --from=build-web /app/apps/web/.env.example /etc/import-meta-env/example

#
# --- Stage: api ---
#
FROM node:${NODE_VERSION}-alpine AS api
ENV NODE_ENV production
WORKDIR /app
COPY --from=build-api --chown=nobody /app/apps/api/package.json .
COPY --from=build-api --chown=nobody /out ./

ARG BUILD_COMMIT
ARG BUILD_NUMBER
ARG BUILD_TIMESTAMP

ENV BUILD_COMMIT=$BUILD_COMMIT
ENV BUILD_NUMBER=$BUILD_NUMBER
ENV BUILD_TIMESTAMP=$BUILD_TIMESTAMP

EXPOSE 3000
