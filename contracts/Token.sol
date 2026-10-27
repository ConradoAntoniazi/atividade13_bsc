// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Turing is ERC20 {
    mapping(string => address) public users;
    mapping(address => string) public addresses;
    address private immutable owner;

    constructor() {
        users["roberta"] = 0x502542668aF09fa7aea52174b9965A7799343Df7;
        users["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        users["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        users["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        users["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        users["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;

        addresses[0x502542668aF09fa7aea52174b9965A7799343Df7] = "roberta";
        addresses[0x70997970C51812dc3A010C7d01b50e0d17dc79C8] = "nome1";
        addresses[0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC] = "nome2";
        addresses[0x90F79bf6EB2c4f870365E785982E1f101E93b906] = "nome3";
        addresses[0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65] = "nome4";
        addresses[0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc] = "nome5";

        owner = msg.sender;
    }

    modifier onlyAdmin() {
        require(
            msg.sender == owner || msg.sender == users["roberta"],
            "Apenas o dono do contrato ou a Roberta podem executar essa acao!"
        );
        _;
    }

    function updateUser(string memory codinome, address user_addr) public onlyAdmin() {
        require(codinome.length > 0, "Erro: codinome invalido");
        users[codinome] = user_addr;
    }

}
