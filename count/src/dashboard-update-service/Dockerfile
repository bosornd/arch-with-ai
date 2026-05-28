# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json for workspace
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json

# Copy and build common modules first (only count-value needed)
COPY common/count-value ./common/count-value
WORKDIR /app/common/count-value
RUN npm install --legacy-peer-deps && npm run build

# Build service
WORKDIR /app
COPY dashboard-update-service/package.json ./dashboard-update-service/package.json
COPY dashboard-update-service/tsconfig.json ./dashboard-update-service/tsconfig.json
COPY dashboard-update-service/src ./dashboard-update-service/src

# Update package.json to use local file paths for common modules (for builder stage)
WORKDIR /app
RUN node -e "\
  const fs = require('fs');\
  const pkg = JSON.parse(fs.readFileSync('./dashboard-update-service/package.json', 'utf8'));\
  pkg.dependencies = pkg.dependencies || {};\
  if (pkg.dependencies['@count/common-count-value'] === 'workspace:*') {\
    pkg.dependencies['@count/common-count-value'] = 'file:./common/count-value';\
  }\
  fs.writeFileSync('./dashboard-update-service/package.json', JSON.stringify(pkg, null, 2));\
"

# Install dependencies at root level (workspace)
WORKDIR /app
RUN npm install --legacy-peer-deps

# Build service
WORKDIR /app/dashboard-update-service
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built common modules with dependencies
COPY --from=builder /app/common/count-value ./common/count-value

# Install common module dependencies
WORKDIR /app/common/count-value
RUN npm install --production --legacy-peer-deps

# Copy service package and built files
WORKDIR /app
COPY --from=builder /app/dashboard-update-service/package.json ./package.json.tmp
COPY --from=builder /app/dashboard-update-service/dist ./dist

# Update package.json to use local file paths for common modules
RUN node -e "\
  const fs = require('fs');\
  const pkg = JSON.parse(fs.readFileSync('./package.json.tmp', 'utf8'));\
  pkg.dependencies = pkg.dependencies || {};\
  pkg.dependencies['@count/common-count-value'] = 'file:./common/count-value';\
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));\
" && \
npm install --production --legacy-peer-deps

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]
