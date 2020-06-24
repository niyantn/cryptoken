// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;

contract cryptoken{
    uint256 private _totalSupply;
    mapping (address => uint256) private _balances;
    string private _name = "Ming";
    string private _symbol = "MNG";

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    constructor(uint256 supply) public {
        _totalSupply = supply;
        _balances[msg.sender] = supply;
    }
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }
    function name() public view returns (string memory) {
        return _name;
    }
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    function transfer(address to, uint256 val) public returns (bool){
        require(val<= _balances[msg.sender]);
        _balances[msg.sender] -= val;
        _balances[to] += val;
        emit Transfer(msg.sender, to, val);
        return true;
    }
}