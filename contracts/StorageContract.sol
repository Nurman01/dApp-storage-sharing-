// contracts/StorageContract.sol
pragma solidity ^0.8.0;

contract StorageContract {
    struct StorageOffer {
        address provider;
        uint256 size;
        uint256 price;
        bool available;
    }
    
    struct StorageRequest {
        address consumer;
        uint256 size;
        uint256 price;
        bool fulfilled;
    }

    StorageOffer[] public offers;
    StorageRequest[] public requests;

    mapping(address => uint256) public balances;

    event OfferCreated(uint256 offerId, address provider, uint256 size, uint256 price);
    event RequestCreated(uint256 requestId, address consumer, uint256 size, uint256 price);
    event ContractCompleted(address provider, address consumer, uint256 amount);

    function provideStorage(uint256 size, uint256 price) public {
        offers.push(StorageOffer(msg.sender, size, price, true));
        emit OfferCreated(offers.length - 1, msg.sender, size, price);
    }

    function requestStorage(uint256 offerId) public payable {
        StorageOffer storage offer = offers[offerId];
        require(offer.available, "Storage not available");
        require(msg.value == offer.price, "Incorrect payment");

        offer.available = false;
        balances[offer.provider] += msg.value;
        
        requests.push(StorageRequest(msg.sender, offer.size, offer.price, true));
        emit ContractCompleted(offer.provider, msg.sender, msg.value);
    }

    function withdrawBalance() public {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        balances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }
}
