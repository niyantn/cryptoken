// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;

contract cryptoken{
    uint256 _totalSupply;

    //Constructor
    constructor() public {
        _totalSupply = 1000000;
    }
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    //Set total number of tokens

    //Read total number of tokens
}