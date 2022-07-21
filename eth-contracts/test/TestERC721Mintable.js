const SD1Token = artifacts.require('SD1Token');
let sd1Token = null

contract('TestSD1Token', accounts => {
    describe('match erc721 spec', () => {
        beforeEach(async () => {
            sd1Token = await SD1Token.new()
            // TODO: mint multiple tokens
            await sd1Token.mint(accounts[1], 1)
            await sd1Token.mint(accounts[1], 2)
            await sd1Token.mint(accounts[1], 3)
            await sd1Token.mint(accounts[2], 4)
            await sd1Token.mint(accounts[2], 5)
        })

        it('should return total supply', async () => {
            assert.equal(await sd1Token.totalSupply(), 5)
        })

        it('should get token balance', async () => {
            assert.equal(await sd1Token.balanceOf(accounts[0]), 0)
            assert.equal(await sd1Token.balanceOf(accounts[1]), 3)
            assert.equal(await sd1Token.balanceOf(accounts[2]), 2)
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async () => {
            assert.equal(
                await sd1Token.tokenURI(1),
                "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1"
            )
            assert.equal(
                await sd1Token.tokenURI(3),
                "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/3"
            )
            assert.equal(
                await sd1Token.tokenURI(5),
                "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/5"
            )
        })

        it('should transfer token from one owner to another', async () => {
            await sd1Token.safeTransferFrom(accounts[1], accounts[2], 1, { from: accounts[1] })
            assert.equal(await sd1Token.balanceOf(accounts[1]), 2)
            assert.equal(await sd1Token.balanceOf(accounts[2]), 3)
            assert.equal(await sd1Token.ownerOf(1), accounts[2])
        })
    })

    describe('have ownership properties', () => {
        beforeEach(async () => {
            sd1Token = await SD1Token.new()
        })

        it('should fail minting when address is not contract owner', async () => {
            try {
                await sd1Token.mint(accounts[2], 1, { from: accounts[1] })
                assert.fail("Should fail minting if caller is not the contract owner")
            } catch (err) {
                assert.isTrue(err.message.includes("Caller is not contract owner"))
            }
        })

        it('should return contract owner', async () => {
            assert.equal(await sd1Token.owner(), accounts[0])
        })
    })
})