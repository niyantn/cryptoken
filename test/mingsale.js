//const _deploy_contracts = require("../migrations/2_deploy_contracts");

const MyToken = artifacts.require("cryptoken");
const MyTokenSale = artifacts.require("mingsale");

contract('mingsale', function(accounts) {
    var tokeninstance;
    var tokensaleinstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000; //wei
    var availtokens = 100;

    it('initializes the contract with the correct values', function() {
        return MyTokenSale.deployed().then(function(instance) {
            tokensaleinstance = instance;
            return tokensaleinstance.address;
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokensaleinstance.getTokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokensaleinstance.getTokenPrice();
        }).then(function(value) {
            assert.equal(value.toNumber(), tokenPrice, 'has token price');
        });
    });

    it('facilitates token purchasing', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            return MyTokenSale.deployed();
        }).then(function(instance) {
            tokensaleinstance = instance;
            return tokeninstance.transfer(tokensaleinstance.address, availtokens, { from: admin });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
            assert.equal(receipt.logs[0].args._from, admin, 'logs account tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, tokensaleinstance.address, 'logs account tokens are trasnferred to');
            assert.equal(receipt.logs[0].args._value, availtokens, 'logs transfer amount');
            return tokensaleinstance.buyTokens(10, { from: buyer, value: 10 * tokenPrice });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'triggers a Sell event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs purchasing account');
            assert.equal(receipt.logs[0].args._amount, 10, 'logs purchased amount');
            return tokensaleinstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), 10, 'increments number of tokens sold');
            return tokeninstance.balanceOf(tokensaleinstance.address);
        }).then(function(amount) {
            assert.equal(amount.toNumber(), 90, 'decrements available tokens');
            return tokeninstance.balanceOf(buyer);
        }).then(function(amount) {
            assert.equal(amount.toNumber(), 10, 'increments bought tokens');
            return tokensaleinstance.buyTokens(10, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal price of tokens in wei');
            return tokensaleinstance.buyTokens(92, { from: buyer, value: 92 * tokenPrice })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot buy more tokens than available');
        });
    });

    it('ends token sale', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            return MyTokenSale.deployed();
        }).then(function(instance) {
            tokensaleinstance = instance;
            return tokensaleinstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'must be admin to end sale');
            return tokensaleinstance.endSale({ from: admin });
        }).then(function(receipt) {
            return tokeninstance.balanceOf(admin);
        }).then(function(amount) {
            assert.equal(amount.toNumber(), 999990, 'returns unsold tokens to admin');
            return tokeninstance.balanceOf(tokensaleinstance.address);
        }).then(function(amount) {
            assert.equal(amount.toNumber(), 0, 'sale contract left broke');
        });
    });
})