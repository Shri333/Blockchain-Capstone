pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;
import "./ERC721Mintable.sol";

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
contract SquareVerifier {
    struct G1Point {
        uint256 X;
        uint256 Y;
    }
    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }
    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }

    function verifyTx(Proof memory proof, uint256[2] memory input)
        public
        view
        returns (bool);
}

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is SD1Token {
    // TODO define a solutions struct that can hold an index & an address
    struct Solution {
        uint256 index;
        address sender;
        bool used;
    }

    // TODO define an array of the above struct
    Solution[] private solutionList;

    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => Solution) private uniqueSolutions;
    mapping(uint256 => Solution) private solutionMap;

    // TODO Create an event to emit when a solution is added
    event SolutionAdded(address sender, uint256 index);

    SquareVerifier private verifier;

    constructor(address contractAddress) public {
        verifier = SquareVerifier(contractAddress);
    }

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution(
        SquareVerifier.Proof calldata proof,
        uint256[2] calldata input
    ) external {
        bytes32 solutionHash = keccak256(abi.encode(proof, input));
        require(
            uniqueSolutions[solutionHash].sender == address(0),
            "Solution is not unique"
        );
        require(verifier.verifyTx(proof, input), "Solution is incorrect");
        Solution memory solution = Solution(
            solutionList.length,
            msg.sender,
            false
        );
        solutionList.push(solution);
        uniqueSolutions[solutionHash] = solution;
        solutionMap[solution.index] = solution;
        emit SolutionAdded(msg.sender, solution.index);
    }

    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function mint(
        address to,
        uint256 tokenId,
        uint256 solutionIndex
    ) external {
        require(
            !solutionMap[solutionIndex].used,
            "Solution has already been used"
        );
        require(
            solutionMap[solutionIndex].sender == msg.sender,
            "You did not add the solution with the given index"
        );
        require(
            solutionIndex < solutionList.length,
            "Solution index is invalid"
        );
        solutionMap[solutionIndex].used = true;
        mint(to, tokenId);
    }
}
