# hCaptcha Blob Encryption



# Showcase

https://github.com/user-attachments/assets/1ac48548-c295-4764-9b3a-c3a8fe8a37b4

## Thanks

Thanks to epicmatthew23 for decrypting and confirming that the solution works <3
![ty](https://github.com/user-attachments/assets/174fab6c-13ab-4c6d-9cf6-0347ff1311c4)


A sandbox solution for encrypting hCaptcha fingerprint blobs with moderate performance (~750ms).

> Fun fact: I HATE JSDOM
> 
> fun fact: I used Python for the API because the Node.js encryption can't run multiple times without errors (and I was too lazy to fix that 😅)
> if you can see and execute a js code, it means you can sandbox it hehe

## Overview

hCaptcha creates browser fingerprints through its JavaScript code. These fingerprints need to be encrypted for use with hCaptcha's services. This project provides a lightweight sandbox environment to perform this encryption.



## Why This Tool?

- **Moderate Performance**: Parsing takes around 300 ms
- **Version Caching**: Since hCaptcha has a limited HSW version pool, you can save version-specific sandboxes (e.g., `version_sandbox.js`) for improved processing / I made it myself and added to repo, cuz no one understand the idea
- **Simple Implementation**: Straightforward approach to fingerprint encryption

## Features

- **Fingerprint Encryption**: Efficiently encrypts hCaptcha browser fingerprints
- **Dynamic HSW Version Support**: Compatible with different versions of hCaptcha's security wrapper
- **REST API Interface**: Simple HTTP endpoint for encryption requests
- **Sandboxed Execution**: All operations run in a secure VM environment

## Installation

1. Clone the repository:
```bash
git clone https://github.com/emrovsky/hcaptcha-blob-encryption.git
cd hcaptcha-blob-encryption
```

2. Install dependencies:
```bash
npm install @babel/parser @babel/traverse @babel/generator express request
pip install flask
```

## Usage

1. Start the Flask server:
```bash
python app.py
```

2. Send encryption requests to the API:
```bash
curl -X POST http://localhost:1337/encrypt \
-H "Content-Type: application/json" \
-d '{
    "version": "1a2b3c4d",
    "array": [1, 2, 3, 4, 5]  // Your fingerprint blob array
}'
```

### API Endpoint

`POST /encrypt`

Request body:
```json
{
    "version": "string",  // HSW version
    "array": "number[]"   // Fingerprint blob to encrypt
}
```

Response:
```json
{
    "success": true,
    "result": "encrypted_string"  // Encrypted blob result
}
```

## Performance Optimization

Since hCaptcha maintains a limited pool of HSW versions, you can optimize performance by:
1. Creating sandboxes for each HSW version
2. Saving them as `version_sandbox.js` files
3. Reusing these saved sandboxes instead of fetching and processing the HSW script each time

## How It Works

1. Receives a fingerprint blob (generated by hCaptcha's JavaScript, not part of this tool)
2. Fetches or loads the appropriate HSW version
3. Sets up a lightweight VM sandbox
4. Encrypts the fingerprint blob
5. Returns the encrypted result

## Security Considerations

- All operations run in a sandboxed VM environment
- Input validation prevents malicious data injection
- No sensitive data is stored or logged
- For legitimate testing purposes only

## Technical Details

The project utilizes:
- `@babel/parser`: For processing HSW scripts
- `vm`: Node.js virtual machine for sandboxed execution
- Flask: For API routing and request handling (used Python because it handles multiple encryption requests better than the Node.js implementation)

## Disclaimer

This tool is for educational and testing purposes only. Users are responsible for ensuring their use complies with hCaptcha's terms of service and applicable laws.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contributing

Contributions are welcome! Please feel free to submit pull requests.
