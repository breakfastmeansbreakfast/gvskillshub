# Sample: Emoji Puzzle Game - Next.js Deployment on AWS 🎮

## About This Sample

This sample demonstrates how to build and deploy a modern, interactive web application using Next.js 15 and AWS infrastructure. The implementation showcases serverless static hosting patterns using CloudFront and S3, deployed through Infrastructure as Code with AWS CDK.

**What You'll Learn:**
- Static Next.js application deployment on AWS
- CloudFront distribution configuration with Origin Access Control
- S3 bucket security hardening and encryption
- Infrastructure as Code best practices with AWS CDK
- Security validation using cdk-nag

> **Note**: This sample code accompanied a presentation demonstrating modern web application deployment patterns on AWS. It is provided for educational purposes to help developers understand AWS service integration patterns.

## Application Overview

The sample implements an emoji-based puzzle game that challenges players to decode emoji sequences representing brands, films, sports, geographic locations, and common sayings. The game operates entirely client-side with no backend services, user data collection, or authentication - demonstrating a pure static web application pattern.

**Key Features:**
- 50+ emoji clues across 6 categories
- Progressive hint system with dynamic scoring
- Responsive design for all devices
- Session-based score tracking
- Fully client-side implementation (no server required)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   End User      │────▶│   CloudFront     │────▶│   S3 Bucket     │
│   Browser       │     │   Distribution   │     │   (Static)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

**AWS Services Used:**
- **CloudFront** - Global CDN with HTTPS, DDoS protection (AWS Shield Standard)
- **S3** - Static file hosting with encryption at rest, versioning enabled
- **Origin Access Control** - Ensures S3 is only accessible via CloudFront

**Security Features:**
- HTTPS-only traffic enforcement
- S3 BlockPublicAccess enabled
- Origin Access Control (OAC) for secure S3 access
- Bucket encryption at rest
- Infrastructure validated with cdk-nag

## Quick Start

### Prerequisites
- Node.js v24+
- AWS CLI configured with appropriate credentials
- AWS CDK installed (`npm install -g aws-cdk`)

### Deployment

```bash
# Full deployment (build + infrastructure + deploy)
make all

# Or step by step:
make build          # Build Next.js app
make deploy-infra   # Deploy AWS infrastructure
make deploy-app     # Deploy app to S3 + invalidate CloudFront
```

### Local Development

```bash
cd future-craft
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
sample-emoji-puzzle-game-nextjs/
├── future-craft/          # Next.js application
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   └── data/          # Game clues (JSON)
│   └── public/            # Static assets
├── infrastructure/        # AWS CDK code
│   ├── lib/               # CDK stack definitions
│   └── test/              # Infrastructure tests
├── threat-model/          # Security documentation
├── Makefile               # Build & deployment automation
└── README.md              # This file
```

## Security

- All traffic served over HTTPS
- S3 bucket has BlockPublicAccess enabled
- Origin Access Control restricts S3 to CloudFront only
- No user data collected or stored
- Infrastructure as Code validated with cdk-nag

For detailed security analysis, see `threat-model/`.

## Testing

```bash
make test           # Run all tests
make test-infra     # Infrastructure tests only
make test-deploy    # Deployment tests only
```

## Documentation

- [Application README](future-craft/README.md) - Next.js app details
- [Infrastructure README](infrastructure/README.md) - AWS CDK and deployment

## Important Notes

### Development/Test Environment

This sample is configured for development and testing purposes. For production deployments, consider implementing:

- **AWS WAF** - Protection against common web exploits
- **CloudFront Access Logging** - Request logging for analysis
- **Custom TLS Certificate** - Using AWS Certificate Manager

See `infrastructure/README.md` for detailed production recommendations.

### Deployment Account

This sample should be deployed to an isolated development or test AWS account, not a production account.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Next.js 15 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5.9 |
| Infrastructure | AWS CDK 2.x |
| CDN | CloudFront |
| Storage | S3 |
| Testing | Jest 29 |

## Cleanup

To remove all deployed resources:

```bash
cd infrastructure
cdk destroy
```

## License

This sample code is made available under the MIT-0 license. See the LICENSE file.

## Contributing

This sample demonstrates specific AWS deployment patterns. While issues and pull requests are welcome for bug fixes or clarifications, please note that this is sample code with a specific educational purpose.
