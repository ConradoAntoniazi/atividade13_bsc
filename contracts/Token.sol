// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Turing is ERC20 {
    using Strings for string;

    mapping(string => address) public users;
    mapping(address => string) private codinames;
    mapping(string => uint16) private countVote;
    mapping(string => mapping(string => bool)) private hasVote;
    address private immutable owner;
    bool private voting;

    constructor() ERC20("Turing", "TCAS") {
        users["roberta"] = 0x502542668aF09fa7aea52174b9965A7799343Df7;
        users["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        users["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        users["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        users["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        users["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;

        codinames[0x502542668aF09fa7aea52174b9965A7799343Df7] = "roberta";
        codinames[0x70997970C51812dc3A010C7d01b50e0d17dc79C8] = "nome1";
        codinames[0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC] = "nome2";
        codinames[0x90F79bf6EB2c4f870365E785982E1f101E93b906] = "nome3";
        codinames[0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65] = "nome4";
        codinames[0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc] = "nome5";

        owner = msg.sender;
        voting = true;
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    modifier onlyAdmin() {
        require(
            msg.sender == owner || msg.sender == users["roberta"],
            "Apenas o dono do contrato ou a Roberta podem executar essa acao!"
        );
        _;
    }

    modifier validCodinome(string memory codinome) {
        require(!codinames[users[codinome]].equal(""), "Erro: condinome invalido!");
        _;
    }

    function updateUser(string memory codinome, address user_addr) public onlyAdmin() validCodinome(codinome) {
        delete codinames[users[codinome]]; 
        users[codinome] = user_addr;
        codinames[user_addr] = codinome;
    }

    function votingOn() public onlyAdmin(){
        voting = true;
    }

    function votingOff() public onlyAdmin() {
        voting = false;
    }

    function issueToken(string memory codinome, uint256 qtde_de_Turings) public onlyAdmin() validCodinome(codinome) {
        _mint(users[codinome], qtde_de_Turings);
    }

    function vote(string memory codinome, uint256 qtde_de_Turings) public validCodinome(codinome) {
        require(voting == true, "A votacao deve estar ativa!");
        require(!codinames[msg.sender].equal(""), "Apenas usuarios pre-autorizado podem executa-la!");
        require(!codinames[msg.sender].equal(codinome), "Um usuario NAO pode votar em si mesmo.");
        require(qtde_de_Turings > 0 && qtde_de_Turings <= 2, "qtde_de_Turings deve ser maior que 0, e menor ou igual a 2.");
        require(hasVote[codinames[msg.sender]][codinome] == false, "Um mesmo usuario so pode votar uma vez em um mesmo codinome.");

        _mint(users[codinome], qtde_de_Turings);
        countVote[codinames[msg.sender]] += 1;

        if(countVote[codinames[msg.sender]] == 10) {
            _mint(msg.sender, 1);
        }
    }
}
