// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductAuthentication {
    address public owner;
    
    struct Product {
        string productId;
        string productName;
        string metadata;
        string ipfsHash;
        address manufacturer;
        uint256 creationTime;
        bool isAuthentic;
    }
    
    // Map unique QR codes to products
    mapping(string => Product) public products;
    
    // Events
    event ProductRegistered(string qrCodeId, string productName, address manufacturer);
    event ProductVerified(string qrCodeId, bool isAuthentic);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    // Register a new product with a unique QR code
    function registerProduct(
        string memory qrCodeId,
        string memory productId,
        string memory productName,
        string memory metadata,
        string memory ipfsHash
    ) public {
        // Check if QR code already exists
        require(bytes(products[qrCodeId].productId).length == 0, "This QR code has already been registered");
        
        // Register the product
        products[qrCodeId] = Product({
            productId: productId,
            productName: productName,
            metadata: metadata,
            ipfsHash: ipfsHash,
            manufacturer: msg.sender,
            creationTime: block.timestamp,
            isAuthentic: true
        });
        
        emit ProductRegistered(qrCodeId, productName, msg.sender);
    }
    
    // Batch register multiple products at once
    function batchRegisterProducts(
        string[] memory qrCodeIds,
        string memory productId,
        string memory productName,
        string memory metadata,
        string memory ipfsHash
    ) public {
        for (uint i = 0; i < qrCodeIds.length; i++) {
            registerProduct(qrCodeIds[i], productId, productName, metadata, ipfsHash);
        }
    }
    
    // Verify if a product is authentic
    function verifyProduct(string memory qrCodeId) public view returns (bool, Product memory) {
        Product memory product = products[qrCodeId];
        return (product.isAuthentic, product);
    }
}
