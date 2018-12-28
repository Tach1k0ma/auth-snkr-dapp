pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Snkr is ERC721Token, Ownable{
    uint256 public sneaker_id;

    mapping (uint => Sneaker) public sneaker_id_to_struct;
    //keep tracks of ownership
    mapping (uint => address[]) public sneaker_id_to_owners;
    //keep tracks of verifiers
    mapping (uint => address[]) public sneaker_id_to_verifiers;

    struct Sneaker {
        string image_url;
        string sku;
        uint256 time_created;
        uint256 upc;
        uint256 sneaker_id;
    }

    //when transfered, we want to track this time
    //the transfering function is calling this function
    //todo
    // function trackHistory() internal returns (uint) {
    //     return now;
    // }


    function Snkr(string _name, string _symbol) ERC721Token(_name, _symbol) Ownable() public{ }

    //not needed because we have totalSupply in ERC721Token.sol
        // function getDogsLen() view external returns(uint256){
        //     return doggs.length;
        // }

    function mint(string _image_url, string _sku, uint256 _upc) external onlyOwner{
        // we don't need to pass in sneaker_id as an argument to the mint function because of the line below:
        sneaker_id++;

        uint time_created = now;

        Sneaker memory sneaker = Sneaker({ image_url: _image_url, sku: _sku, time_created: time_created, upc: _upc, sneaker_id: sneaker_id});

        sneaker_id_to_struct[sneaker_id] = sneaker;

        sneaker_id_to_owners[sneaker_id] = [msg.sender];

        _mint(msg.sender, sneaker_id);
    }

    // when snkr token is transfered to new owner then the sneaker_id_to_owners mapping (the owner history of the snkr token) is updated
    // function to be called when transferring the token
    function updateTokenHistory(uint256 sneaker_id, address newOwner) external onlyOwner{
        address[] tokenHistory;
        tokenHistory = sneaker_id_to_owners[sneaker_id];
        tokenHistory.push(newOwner);
        sneaker_id_to_owners[sneaker_id] = tokenHistory;
    }

    function validate(address _currentOwnerAddress, uint sneaker_id_input) public view returns(bool) {
        // use an interface to access other contracts

        address[] owners = sneaker_id_to_owners[sneaker_id_input];
        address actualCurrentOwner = owners[owners.length - 1];
        bool results = _currentOwnerAddress == actualCurrentOwner;

        // this also works
        // bool results = bytes32(_currentOwnerAddress) == bytes32(actualCurrentOwner);
        return results;
    }
}
