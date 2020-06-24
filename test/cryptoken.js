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

    it('approves tokens for delegated transfer', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            return tokeninstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokeninstance.approve(accounts[1], 100, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be Approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs account tokens are owned by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs account tokens can be spent by');
            assert.equal(receipt.logs[0].args._value, 100, 'logs approval amount');
            return tokeninstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, 'allocates allowance from owner to spender');
        });
    });

    it('handles delegated token transfers', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            fromacc = accounts[2];
            toacc = accounts[3];
            spendacc = accounts[4];
            return tokeninstance.transfer(fromacc, 100, { from: accounts[0] });
        }).then(function(receipt) {
            return tokeninstance.approve(spendacc, 10, { from: fromacc });
        }).then(function(receipt) {
            return tokeninstance.transferFrom(fromacc, toacc, 9999, { from: spendacc });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            return tokeninstance.transferFrom(fromacc, toacc, 20, { from: spendacc });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than allowed');
            return tokeninstance.allowance(fromacc, spendacc);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 10, 'allowance allocated');
            return tokeninstance.transferFrom(fromacc, toacc, 10, { from: spendacc });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
            assert.equal(receipt.logs[0].args._from, fromacc, 'logs account tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, toacc, 'logs account tokens are trasnferred to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs transfer amount');
            return tokeninstance.allowance(fromacc, spendacc);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, 'allowance should be spent');
            return tokeninstance.balanceOf(fromacc);
        }).then(function(bal) {
            assert.equal(bal.toNumber(), 90, 'allowance should be taken from owner account');
            return tokeninstance.balanceOf(toacc);
        }).then(function(bal) {
            assert.equal(bal.toNumber(), 10, 'allowance should be allocated to target account');
        });
    });
})