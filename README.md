# Decentralized Storage System

This is a decentralized file storage system that enables chunked file uploads and retrieval using IPFS. The project consists of two services: a **backend** (NestJS) and a **frontend** (Next.js).


## Features

- **Chunked File Upload**: Supports uploading large files in chunks.
- **IPFS Integration**: Stores and retrieves files using IPFS.


## Requirements

- Ports `3000` (frontend) and `3002` (backend) should be free.


## Installation and Setup

### Clone the Repository
```bash
git clone https://github.com/harshsoni-harsh/d-storage-system
cd d-storage-system
```
set .env for backend as PORT=3002

### Development Setup

1. **Install Dependencies**:
    ```bash
    cd backend
    npm install
    cd ../frontend
    npm install
    ```

2. **Run Backend**:
    ```bash
    cd backend
    npm run start:dev
    ```

3. **Run Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

4. Access the application:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend: [http://localhost:3002](http://localhost:3002)

5. Upload Files
    - Open the frontend at [http://localhost:3000](http://localhost:3000).
    - Select a file to upload.
    - After the upload is completed, a CID (Content Identifier) will be displayed.

## Current progress
- **File Handling**: The project supports file storage and retrieval over IPFS in a local network environment.
- **File Size**: Currently, only small-sized files are supported. Large file uploads require additional chunking and handling mechanisms.
- **Incentivization**: Incentivization models for storage providers are yet to be implemented.
- **Storage Management**: Storage management and optimization are pending configuration.
