// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract NFTBridge is ERC1155, ERC1155Holder, Ownable {
    string internal baseTokenUri;
    uint256 public lastMintedId;
    mapping(address => uint256[]) public tokensOwned;
    mapping(uint256 => bool) public tokensLocked;
    mapping(uint256 => bool) public tokensMinted;

    constructor(string memory _baseTokenUri) ERC1155(_baseTokenUri) {
        baseTokenUri = _baseTokenUri;
        lastMintedId = 0;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function uri(uint256 _tokenid) public override view returns (string memory) {
        return string(
            abi.encodePacked(
                baseTokenUri,
                Strings.toString(_tokenid % 50),".json"
            )
        );
    }

    function getTokensOwned() public view returns (uint256[] memory) {
        return tokensOwned[_msgSender()];
    }

    function mint(uint256 tokenId) public{
        require(lastMintedId<tokenId, "token already minted");
        tokensOwned[_msgSender()].push(tokenId);
        //allow only one mint at a time
        lastMintedId = tokenId;
        _mint(_msgSender(), tokenId, 1, "");
        markTokenAsMinted(tokenId);
    }

    function lockNft(uint256 tokenId, uint256 index, address owner) public onlyOwner{
        //ensure the contract is approved
        require(tokensOwned[owner][index] == tokenId, "Unauthorized: not owner of token");
        //remove tokenId from array
        uint256[] storage usertokenIds = tokensOwned[owner];
        usertokenIds[index] = usertokenIds[usertokenIds.length - 1];
        usertokenIds.pop();

        tokensLocked[tokenId] = true;
        safeTransferFrom(owner, address(this), tokenId, 1, "");
    }

    function unLockNft(uint256 tokenId, address receiver_id) public onlyOwner{
        //check if it has already been minted
        if(isTokenMinted(tokenId)){
            require(tokensLocked[tokenId], "token is held by someone else");
            tokensOwned[receiver_id].push(tokenId);

            _safeTransferFrom(address(this), receiver_id,tokenId, 1, "");

            //mark as unlocked
            tokensLocked[tokenId] = false;
        }else{
            // else if it has not been minted, mint to user
            tokensOwned[receiver_id].push(tokenId);
            _mint(receiver_id, tokenId, 1, "");
            markTokenAsMinted(tokenId);
        }
    }

    function isTokenLocked(uint256 tokenId) public view returns (bool){
        return tokensLocked[tokenId];
    }

    function isTokenMinted(uint256 tokenId) public view returns (bool){
        return tokensMinted[tokenId];
    }

    function markTokenAsMinted(uint256 tokenId) private{
        tokensMinted[tokenId] = true;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, ERC1155Receiver) returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }
}