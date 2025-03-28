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
    
    mapping(string => Product) public products;
    
    event ProductRegistered(string qrCodeId, string productName, address manufacturer);
    event ProductVerified(string qrCodeId, bool isAuthentic);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    function registerProduct(
        string memory qrCodeId,
        string memory productId,
        string memory productName,
        string memory metadata,
        string memory ipfsHash
    ) public {
        require(bytes(products[qrCodeId].productId).length == 0, "This QR code has already been registered");
        
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
    
    function verifyProduct(string memory qrCodeId) public view returns (bool, Product memory) {
        Product memory product = products[qrCodeId];
        return (product.isAuthentic, product);
    }
}
