const hre = require("hardhat");
async function main() {

    const owner = await hre.ethers.getSigners();

    const MintFactory = await hre.ethers.getContractFactory("Mint");
    const mint = await MintFactory.deploy();
    await mint.deployed();
    console.log("mint addresss: ", mint.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});