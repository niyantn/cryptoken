//const _deploy_contracts = require("../migrations/2_deploy_contracts");

var MyToken = artifacts.require("cryptoken");

contract('MyToken', function(accounts) {
    var tokeninstance;

    it('initializes contract with correct values', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            return tokeninstance.name();
        }).then(function(name) {
            assert.equal(name, 'Ming', 'has the correct name');
            return tokeninstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'MNG', 'has the correct symbol');
        });
    });

    it('allocates the total supply upon deployment', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            return tokeninstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to the initial supply');
            return tokeninstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
        });
    });

    it('transfers taken ownership', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            return tokeninstance.transfer.call(accounts[1], 9999999999);
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokeninstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokeninstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs account tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs account tokens are trasnferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs transfer amount');
            return tokeninstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
            return tokeninstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
        });
    });
})