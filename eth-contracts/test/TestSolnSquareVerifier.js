const SolnSquareVerifier = artifacts.require('SolnSquareVerifier')
let solnSquareVerifier = null
let proofs = null

contract('TestSolnSquareVerifier', accounts => {
    before(async () => {
        solnSquareVerifier = await SolnSquareVerifier.deployed()
        proofs = []
        for (let i = 1; i <= 10; i++) {
            const proof = require(`../../zokrates/code/square/proof${i}.json`)
            proofs.push(proof)
        }
    })

    describe('test adding solutions (addSolution)', () => {
        // Test if a new solution can be added for contract - SolnSquareVerifier
        it('can add a unique solution to the contract', async () => {
            const proof = proofs[0]
            const sender = accounts[0]
            const solutionIndex = 0
            const result = await solnSquareVerifier.addSolution(proof.proof, proof.inputs)
            assert.equal(result.logs.length, 1)

            const { event, args } = result.logs[0]
            assert.equal(event, 'SolutionAdded')
            assert.equal(args.sender, sender)
            assert.equal(args.index, solutionIndex)
        })

        it('cannot add a non-unique solution to the contract', async () => {
            const proof = proofs[0]
            try {
                await solnSquareVerifier.addSolution(proof.proof, proof.inputs)
                assert.fail("Should not be able to add a non-unique solution")
            } catch (err) {
                assert.isTrue(err.message.includes("Solution is not unique"))
            }
        })

        it('cannot add an incorrect solution', async () => {
            const proof = require('../../zokrates/code/square/incorrect_proof.json')
            try {
                await solnSquareVerifier.addSolution(proof.proof, proof.inputs)
                assert.fail("Should not be able to add an incorrect solution")
            } catch (err) {
                assert.isTrue(err.message.includes("Solution is incorrect"))
            }
        })
    })

    describe('test minting tokens (mint)', () => {
        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
        it('can mint a new token with a unused solution', async () => {
            const from = accounts[0]
            const to = accounts[1]
            const tokenId = 1
            const solutionIndex = 0
            const result = await solnSquareVerifier.mint(to, tokenId, solutionIndex)
            assert.equal(result.logs.length, 1)

            const { event, args } = result.logs[0]
            assert.equal(event, 'Transfer')
            assert.equal(args.from, from)
            assert.equal(args.to, to)
            assert.equal(args.tokenId, tokenId)
        })

        it('cannot mint a new token with a used solution', async () => {
            const to = accounts[1]
            const tokenId = 2
            const solutionIndex = 0
            try {
                await solnSquareVerifier.mint(to, tokenId, solutionIndex)
                assert.fail("Should not be able to mint a new token with a used solution")
            } catch (err) {
                assert.isTrue(err.message.includes("Solution has already been used"))
            }
        })

        it(`cannot mint a new token with an unused solution
            that was not added by an account`, async () => {
            const proof = proofs[1]
            const result = await solnSquareVerifier.addSolution(proof.proof, proof.inputs)
            const solutionIndex = result.logs[0].args.index

            const from = accounts[1]
            const to = accounts[0]
            const tokenId = 2
            try {
                await solnSquareVerifier.mint(to, tokenId, solutionIndex, { from })
                assert.fail(`Should not be able to mint a new token with an unused 
                             solution that was not added by an account`)
            } catch (err) {
                const message = 'You did not add the solution with the given index'
                assert.isTrue(err.message.includes(message))
            }
        })
    })
})