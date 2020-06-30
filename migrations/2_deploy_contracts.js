const MyToken = artifacts.require("cryptoken");
const MyTokenSale = artifacts.require("mingsale");

module.exports = function(deployer) {
    deployer.deploy(MyToken, 1000000).then(function() {
        return deployer.deploy(MyTokenSale, MyToken.address, 1000000000000000);
    });
};