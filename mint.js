// DON'T RUN THIS SCRIPT!
// I WROTE THIS SCRIPT TO BE ONLY RUN ONCE!
const HDWalletProvider = require('@truffle/hdwallet-provider')
const fs = require('fs')
const Web3 = require('web3')

const mnemonic = fs.readFileSync('.secret').toString().trim()
const infuraKey = fs.readFileSync('.infura').toString().trim()

async function main() {
  // initialize web3
  const provider = new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`)
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()

  // initialize contract
  const ABI = JSON.parse(fs.readFileSync('eth-contracts/build/contracts/SolnSquareVerifier.json').toString()).abi
  const address = '0x9488D332Bc761dEc58493C616187e4f9C556598E'
  const solnSquareVerifier = new web3.eth.Contract(ABI, address)

  // add solutions
  let proofs = []
  for (let i = 1; i <= 10; i++) {
    const data = fs.readFileSync(`zokrates/code/square/proof${i}.json`)
    const proof = JSON.parse(data.toString())
    proofs.push(proof)
  }

  for (const proof of proofs) {
    await solnSquareVerifier
      .methods
      .addSolution(proof.proof, proof.inputs)
      .send({ from: accounts[0] })
      .on('receipt', receipt => {
        const { sender, index } = receipt.events.SolutionAdded.returnValues
        console.log(`SolutionAdded`)
        console.log(`sender: ${sender}`)
        console.log(`index: ${index}`)
        console.log()
      })
  }
  
  // mint tokens
  for (let i = 0; i < 10; i++) {
    await solnSquareVerifier
      .methods
      .mint(accounts[1], i + 1, i)
      .send({ from: accounts[0] })
      .on('receipt', receipt => {
        const { from, to, tokenId } = receipt.events.Transfer.returnValues
        console.log(`Transfer`)
        console.log(`from: ${from}`)
        console.log(`to: ${to}`)
        console.log(`tokenId: ${tokenId}`)
        console.log()
      })
  }

  // gracefully exit
  provider.engine.stop()
}

main()
