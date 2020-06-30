// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

contract cryptoken{
    uint256 private _totalSupply;
    mapping (address => uint256) private _balances;
    mapping (address => mapping(address => uint256)) private _allowed;
    string private _name = "Ming";
    string private _symbol = "MNG";

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    event Approval(
        address indexed _owner,
        address indexed _spender,
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
        require(val <= _balances[msg.sender]);
        require(to != address(0));

        _balances[msg.sender] -= val;
        _balances[to] += val;
        emit Transfer(msg.sender, to, val);
        return true;
    }
    function approve(address spender, uint256 val) public returns (bool){
        require(spender != address(0));

        _allowed[msg.sender][spender] = val;
        emit Approval(msg.sender, spender, val);
        return true;
    }
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowed[owner][spender];
    }
    function transferFrom(address from, address to, uint256 val) public returns (bool){
        require(val <= _balances[from]);
        require(val <= _allowed[from][msg.sender]);
        require(to != address(0));

        _balances[from] -= val;
        _balances[to] += val;
        _allowed[from][msg.sender] -= val;
        emit Transfer(from, to, val);
        return true;
    }
}