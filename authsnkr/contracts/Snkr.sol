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
        uint256 sku;
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

    function mint(string _image_url, uint256 _sku, uint256 _upc) external onlyOwner{
        // we don't need to pass in sneaker_id as an argument to the mint function because of the line below:
        sneaker_id++;

        uint time_created = now;

        Sneaker memory sneaker = Sneaker({ image_url: _image_url, sku: _sku, time_created: time_created, upc: _upc, sneaker_id: sneaker_id});

        sneaker_id_to_struct[sneaker_id] = sneaker;

        _mint(msg.sender, sneaker_id);
    }


}
