// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "./cryptoken.sol";

contract mingsale {
    address private admin;
    cryptoken private tokenContract;
    uint256 private tokenPrice;
    uint256 private sold;

    event Sell(
        address _buyer,
        uint256 _amount
    );
    event End(address _ender, uint256 _enderBalance);
    event State(address _admin, cryptoken _tokenContract, uint256 _tokenPrice, uint256 _sold);

    constructor (cryptoken _instance, uint256 _price) public {
        admin = msg.sender;
        tokenContract = _instance;
        tokenPrice = _price;
    }
    function getTokenContract() public view returns(cryptoken){
        return tokenContract;
    }
    function getTokenPrice() public view returns(uint256){
        return tokenPrice;
    }
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }
    function buyTokens(uint256 _num) public payable returns (bool) {
        //emit State(admin, tokenContract, tokenPrice, sold);
        require(msg.value == multiply(_num, tokenPrice), "value unequal to cost");
        require(tokenContract.balanceOf(address(this)) >= _num, "not enough available tokens");
        require(tokenContract.transfer(msg.sender, _num), "couldn't transfer");

        sold += _num;
        emit Sell(msg.sender, _num);
        return true;
    }
    function tokensSold() public view returns(uint256){
        return sold;
    }
    function endSale() public returns (bool){
        emit End(msg.sender, tokenContract.balanceOf(msg.sender));
        emit End(address(this), tokenContract.balanceOf(address(this)));

        require(msg.sender == admin, "only admin can end sale");
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))), "couldn't transfer");

        return true;
    }
}