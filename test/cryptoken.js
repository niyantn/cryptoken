//const _deploy_contracts = require("../migrations/2_deploy_contracts");

var MyToken = artifacts.require("cryptoken");

contract('MyToken', function(accounts) {
    it('sets the total supply upon deployment', function() {
        return MyToken.deployed().then(function(instance) {
            tokeninstance = instance;
            return tokeninstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
        });
    });
})