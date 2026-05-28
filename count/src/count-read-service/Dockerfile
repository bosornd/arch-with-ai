# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json for workspace
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json

# Copy and build common modules first
COPY common/count-info ./common/count-info
WORKDIR /app/common/count-info
RUN npm install --legacy-peer-deps && npm run build

WORKDIR /app
COPY common/count-value ./common/count-value
WORKDIR /app/common/count-value
RUN npm install --legacy-peer-deps && npm run build

# Build service
WORKDIR /app
COPY count-read-service/package.json ./count-read-service/package.json
COPY count-read-service/tsconfig.json ./count-read-service/tsconfig.json
COPY count-read-service/src ./count-read-service/src

# Update package.json to use local file paths for common modules (for builder stage)
WORKDIR /app
RUN node -e "\
  const fs = require('fs');\
  const pkg = JSON.parse(fs.readFileSync('./count-read-service/package.json', 'utf8'));\
  pkg.dependencies = pkg.dependencies || {};\
  if (pkg.dependencies['@count/common-count-info'] === 'workspace:*') {\
    pkg.dependencies['@count/common-count-info'] = 'file:./common/count-info';\
  }\
  if (pkg.dependencies['@count/common-count-value'] === 'workspace:*') {\
    pkg.dependencies['@count/common-count-value'] = 'file:./common/count-value';\
  }\
  fs.writeFileSync('./count-read-service/package.json', JSON.stringify(pkg, null, 2));\
"

# Install dependencies at root level (workspace)
WORKDIR /app
RUN npm install --legacy-peer-deps

# Build service
WORKDIR /app/count-read-service
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built common modules with dependencies
COPY --from=builder /app/common/count-info ./common/count-info
COPY --from=builder /app/common/count-value ./common/count-value

# Install common module dependencies
WORKDIR /app/common/count-info
RUN npm install --production --legacy-peer-deps

WORKDIR /app/common/count-value
RUN npm install --production --legacy-peer-deps

# Copy service package and built files
WORKDIR /app
COPY --from=builder /app/count-read-service/package.json ./package.json.tmp
COPY --from=builder /app/count-read-service/dist ./dist

# Update package.json to use local file paths for common modules
RUN node -e "\
  const fs = require('fs');\
  const pkg = JSON.parse(fs.readFileSync('./package.json.tmp', 'utf8'));\
  pkg.dependencies = pkg.dependencies || {};\
  pkg.dependencies['@count/common-count-info'] = 'file:./common/count-info';\
  pkg.dependencies['@count/common-count-value'] = 'file:./common/count-value';\
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));\
" && \
npm install --production --legacy-peer-deps

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]
