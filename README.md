# Blockchain Based Electronic Voting System for Pakistan

A decentralized electronic voting system built using **Solidity**, **React + Vite**, **Tailwind CSS**, and **MetaMask**.

This project is developed for educational and demonstration purposes to show how blockchain technology can improve election transparency, security, and automation.

---

# Project Overview

Traditional voting systems face several challenges such as:

- vote tampering
- election rigging
- duplicate voting
- lack of transparency
- slow vote counting
- human errors

This project demonstrates how blockchain technology and smart contracts can solve many of these problems.

The system uses:

- **Ethereum Blockchain**
- **Smart Contracts**
- **MetaMask Wallet**
- **Decentralized Vote Storage**
- **Automatic Vote Counting**

---

# Important Note

This is a **demo/educational voting system**.

The system uses simulated CNIC verification and does NOT connect with:

- NADRA
- biometric verification systems
- government databases

The purpose of this project is to demonstrate blockchain voting concepts and smart contract implementation.

---

# Technologies Used

## Frontend

- React + Vite
- Tailwind CSS
- Ethers.js
- React Router
- MetaMask

## Blockchain

- Solidity
- Ethereum
- Remix IDE
- MetaMask Wallet

---

# System Roles

The system contains three main roles:

---

# 1. Election Commission (Manager)

The Election Commission acts as the manager/admin of the system.

The wallet that deploys the smart contract automatically becomes the manager.

## Manager Responsibilities

### Create Provinces (Demo Halkas)

The manager creates voting regions.

For simplicity, provinces are used as demo halkas.

Example:

- Punjab
- Sindh
- KPK
- Baluchistan
- Islamabad
- Gilgit Baltistan

---

### Add Candidates

The manager adds candidates for each province.

Each candidate contains:

- candidate name
- wallet address
- province
- vote count

---

### Start Election

The manager starts the election and sets duration.

Example:

- 1 hour
- 1 day
- 7 days

Once started:

- voting becomes active
- countdown timer starts

---

### End Election

The manager can manually end the election.

---

### View Statistics

Manager can monitor:

- total provinces
- total candidates
- total votes
- election status

---

# 2. Candidate

Candidates are registered by the manager.

## Candidate Restrictions

Candidates:

- cannot vote
- cannot register as voter
- can only participate as candidates

When a candidate logs into the system, they see a message:

> "You cannot vote because you are registered as a candidate."

---

# 3. Voter

A voter uses MetaMask wallet to participate.

---

# How Voter System Works

## Step 1: Connect MetaMask

The voter connects their MetaMask wallet.

Wallet address acts as blockchain identity.

---

## Step 2: Enter CNIC

The voter enters CNIC number.

Example:

35202-1234567-1

---

## Step 3: Automatic Province Assignment

The system automatically assigns province based on first digit of CNIC.

---

# Demo Province/Halka System

In real elections, voters belong to specific constituencies such as:

- NA-55
- PP-12
- PS-101

However, this demo system uses provinces as simplified halkas because:

- no NADRA integration exists
- no real constituency database is available
- easier to demonstrate blockchain logic

---

# CNIC Province Rules

| First Digit | Province / Region |
|---|---|
| 1 | Khyber Pakhtunkhwa (KPK) |
| 2 | Former FATA |
| 3 | Punjab |
| 4 | Sindh |
| 5 | Baluchistan |
| 6 | Islamabad Capital Territory |
| 7 | Gilgit Baltistan |

---

# Example

## CNIC

35202-1234567-1

First digit = 3

Province assigned = Punjab

The voter can only vote for Punjab candidates.

---

# Voting Workflow

## Step 1

Voter connects MetaMask wallet.

---

## Step 2

Voter enters CNIC.

---

## Step 3

System detects province automatically.

---

## Step 4

Smart contract checks:

- wallet not already registered
- CNIC not already used
- user is not candidate

---

## Step 5

Voter navigates to voting page.

---

## Step 6

Only candidates from assigned province are displayed.

---

## Step 7

Voter casts vote.

Vote becomes a blockchain transaction.

---

## Step 8

Vote is stored permanently on blockchain.

---

## Step 9

Smart contract automatically updates vote count.

---

# Election Timer System

When election starts:

- start time is stored
- end time is calculated
- live countdown timer starts

Once timer ends:

- voting automatically stops
- results become available

---

# Automatic Result System

The smart contract automatically counts votes.

After election ends:

- winners are calculated automatically
- no manual counting required

---

# Blockchain Features Used

## Decentralization

Votes are stored on blockchain network instead of centralized database.

---

## Transparency

All vote transactions are publicly verifiable.

---

## Immutability

Votes cannot be modified after submission.

---

## Smart Contracts

Election rules are enforced automatically by Solidity smart contract.

---

## Wallet Authentication

MetaMask wallets provide blockchain-based authentication.

---

# Security Features

## One Wallet = One Vote

A wallet can vote only once.

---

## One CNIC = One Registration

Duplicate CNIC registration is blocked.

---

## Candidate Restriction

Candidates cannot vote.

---

## Province-Based Voting

Voters can only vote for candidates of their assigned province.

---

# Smart Contract Features

The Solidity smart contract handles:

- province creation
- candidate registration
- voter registration
- election timer
- vote casting
- vote counting
- winner calculation

---

# Frontend Features

## Home Page

Shows:

- election status
- timer
- statistics
- connect wallet button

---

## Manager Dashboard

Allows manager to:

- create provinces
- add candidates
- start election
- end election

---

## Voting Page

Displays:

- voter province
- province candidates
- vote buttons

---

## Results Page

Displays:

- winners
- vote counts
- rankings

---

# Advantages of Blockchain Voting

- transparent elections
- instant vote counting
- reduced human error
- tamper-resistant records
- decentralized storage
- secure transactions

---

# Limitations of This Demo System

This project is educational only.

Current limitations:

- no real NADRA verification
- no biometric authentication
- no real constituency mapping
- MetaMask required
- internet required

---

# Future Improvements

Possible future upgrades:

- NADRA API integration
- biometric verification
- real constituency system
- mobile app
- multi-language support
- encrypted anonymous voting
- IPFS integration
- advanced analytics dashboard

---

# Conclusion

This project demonstrates how blockchain technology can modernize electronic voting systems using smart contracts and decentralized networks.

The system provides:

- transparency
- automation
- vote security
- automatic counting
- decentralized verification

while demonstrating practical blockchain development concepts using Solidity and React.