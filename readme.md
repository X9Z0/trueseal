# Anti-Counterfeiting System using Ethereum Blockchain

This project is a decentralized anti-counterfeiting system built on the Ethereum blockchain. It uses smart contracts to verify the authenticity of products.

## Getting Started

### Backend Setup

1. Start mongodb container using docker:

   ```sh
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. Start the blockchain:

   ```sh
   npm run node
   ```

3. Compile the smart contracts:

   ```sh
   npm run compile
   ```

4. Deploy the smart contracts:

   ```sh
   npm run deploy
   ```

5. Start the backend server:
   ```sh
   npm run dev
   ```

### Frontend Setup (Next.js)

1. Start the frontend:
   ```sh
   npm run dev
   ```

## Known Issues

- **File upload using IPFS is not working**
