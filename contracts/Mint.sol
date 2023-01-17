// SPX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Mint is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    using Strings for uint256;

    struct Prompt {
        uint256 id;
        string prompt;
        string image;
    }

    mapping(uint256 => address) _tokenToOwner;
    mapping(uint256 => Prompt) _tokenToPrompt;
    mapping(uint256 => string) _tokenToImage;

    constructor() ERC721("Mint", "MINT") {}

    function mint(
        address to,
        string memory prompt,
        string memory image
    ) public {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _tokenToOwner[tokenId] = to;
        _safeMint(to, tokenId);
        // string memory json = Base64.encode(
        //     abi.encodePacked(
        //         '{"name": "Justephens #',
        //         Strings.toString(tokenId),
        //         '", "description": "',
        //         prompt,
        //         '", "image": "',
        //         image,
        //         '"}'
        //     )
        // );
        // _tokenToImage[tokenId] = json;
        // _setTokenURI(tokenId, json);
        _tokenToPrompt[tokenId] = Prompt({
            id: tokenId,
            prompt: prompt,
            image: image
        });
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return _tokenToPrompt[tokenId].image;
    }
}
