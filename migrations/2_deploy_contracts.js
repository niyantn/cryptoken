const MyToken = artifacts.require("cryptoken");

module.exports = function(deployer) {
    deployer.deploy(MyToken);
};