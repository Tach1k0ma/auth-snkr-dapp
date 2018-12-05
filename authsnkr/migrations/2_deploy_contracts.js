var Snkr = artifacts.require("Snkr");
var Sale = artifacts.require("Sale");

module.exports = function(deployer) {
	deployer.deploy(Snkr, "SneakerToken", "SNKR").then(function(SneakerToken){
		return deployer.deploy(Sale, SneakerToken.address);
	});
};