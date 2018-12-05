pragma solidity ^0.4.17;

//Here we imported an ERC721 token interface
//We need to have a reference to the non-fungible token contract to be able to call it's methods, like transfer.
import 'zeppelin-solidity/contracts/token/ERC721/ERC721.sol';
import 'zeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol';

contract Sale is ERC721BasicToken{
	//We need to have a reference to the non-fungible token contract to be able to call it’s methods, like transfer
	ERC721 public nonFungibleContract;

	event NewAuction(address seller, uint256 price, uint256 token_id);

	//We need to be able to create new auctions using tokenId and price so we make a struct Auction and the mapping tokenIdToAuction
	struct Auction {
	  address seller;
	  uint256 price;
	}

	//Every auction should be associated with specific token, define a mapping:
	//We made it public so Solidity will automatically generate getter for it.
	mapping (uint256 => Auction) public tokenIdToAuction;

	function Sale(address _nftAddress) public {
		nonFungibleContract = ERC721(_nftAddress);
	}

	//Now we can define a function that will take ownership of the token and create an associated auction:
	//onlyOwnerOf => Guarantees msg.sender is owner of the given token, the function lives in ERC721BasicToken.sol 
	//onlyOwnerOf(_tokenId) taking this off temporarily
	function createAuction(uint256 _tokenId, uint256 _price) onlyOwnerOf(_tokenId) public {
		//Then we create a new instance of our Auction and assign it to a temporary in-memory variable auction.
		Auction memory auction = Auction({
		 seller: msg.sender,
		 price: _price
		});

		//we make a mapping of this auction to our _tokenId.
		tokenIdToAuction[_tokenId] = auction;

		//send the token to the contract from the seller 
		//temp comment out
		nonFungibleContract.transferFrom(msg.sender, address(this), _tokenId);

		emit NewAuction(msg.sender, _price, _tokenId);
	}

	//This method should check if bid value is bigger or equal to auction price and if yes – transfer token to new owner and remove auction.
	//Our function has payable modifier that allows this function to receive money. The received amount can be accessed through msg.value
	function bid( uint256 _tokenId ) public payable {
		require(msg.sender != address(0));

		//First, we get the auction representation from our tokenIdToAuction map
		Auction memory auction = tokenIdToAuction[_tokenId];

		//we check if msg.value is bigger or equal to the auction.price
		require(msg.value >= auction.price);

		//remove the auction, preventing further bids to it
		delete tokenIdToAuction[_tokenId];

		//we temporarily save seller address and price
		address seller = auction.seller;

		//we transfer money to the seller 
		seller.transfer(auction.price);

		//transfer the non fungible token to the bidder 
		//temp comment out
		nonFungibleContract.transferFrom(address(this), msg.sender, _tokenId);
	}

	function cancel( uint256 _tokenId ) public {
		//load the auction in
		Auction memory auction = tokenIdToAuction[_tokenId];

		//we don't need to check that auction.seller is non-zero because we check if it's equal to msg.sender anyway. 
		//We want only auction creator to be able to cancel auctions.
		require(auction.seller == msg.sender);

		//we delete the auction
		delete tokenIdToAuction[_tokenId];

		//send the token back to the seller (which is msg.sender) 
		//temp comment out
		nonFungibleContract.transferFrom(address(this), msg.sender, _tokenId);

	}
}