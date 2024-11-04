// src/app.js
let web3;
let contract;
const contractAddress = '0x3f90F21fbF1d0E8a3448275eE11d6F78E0C7337A';
let isRequestPending = false; // Add a flag to track pending requests

async function loadWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        console.log("Web3 is initialized.");
        await loadContractABI(); // Load contract ABI here
    } else {
        alert("MetaMask is not installed. Please install MetaMask to use this feature!");
    }
}


async function loadContractABI() {
    try {
        const response = await fetch('StorageContractABI.json'); // Ensure this is the correct path
        const contractABI = await response.json();
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contract initialized:", contract); // Log contract to check if it's initialized
    } catch (error) {
        console.error("Failed to load contract ABI:", error);
    }
}


async function connectMetaMask() {
    if (isRequestPending) {
        alert("Connection request already pending. Please respond to the MetaMask prompt.");
        return;
    }

    try {
        if (window.ethereum) {
            isRequestPending = true;

            const connectWalletBtn = document.getElementById("connectWalletBtn");
            connectWalletBtn.disabled = true;

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const accounts = await web3.eth.getAccounts();

            if (accounts.length > 0) {
                console.log("Connected accounts:", accounts);
                await loadContractABI(); // Load the contract ABI here
                alert("Connected to MetaMask successfully!");
                window.location.href = "dashboard.html"; // Redirect to dashboard after connection
            } else {
                alert("No accounts found. Please ensure you're logged in to MetaMask.");
            }
        } else {
            alert("MetaMask is not installed. Please install MetaMask and try again.");
        }
    } catch (error) {
        console.error("Failed to connect to MetaMask:", error);
        alert("An error occurred while connecting to MetaMask. Please try again.");
    } finally {
        isRequestPending = false;
        const connectWalletBtn = document.getElementById("connectWalletBtn");
        connectWalletBtn.disabled = false;
    }
}




// Provide storage function
async function provideStorage() {
    try {
        console.log("Providing storage...");
        if (!web3 || !contract) {
            alert("Web3 or contract is not initialized. Please connect MetaMask first.");
            return;
        }

        const accounts = await web3.eth.getAccounts();

        if (accounts.length === 0) {
            alert("No accounts found. Please ensure you're logged in to MetaMask.");
            return;
        }

        const size = document.getElementById("size").value;
        const price = web3.utils.toWei(document.getElementById("price").value, 'ether');
        
        console.log("Size:", size, "Price:", price); // Debugging output

        await contract.methods.provideStorage(size, price).send({ from: accounts[0] });
        alert("Storage provided!");
    } catch (error) {
        console.error("Failed to provide storage:", error);
    }
}



// Purchase storage function
async function purchaseStorage() {
    try {
        if (!web3 || !contract) {
            alert("Web3 or contract is not initialized. Please connect MetaMask first.");
            return;
        }

        const accounts = await web3.eth.getAccounts();

        if (accounts.length === 0) {
            alert("No accounts found. Please ensure you're logged in to MetaMask.");
            return;
        }

        const offerId = document.getElementById("offerId").value;
        const price = await contract.methods.offers(offerId).call();

        await contract.methods.requestStorage(offerId).send({ from: accounts[0], value: price.price });
        alert("Storage purchased!");
    } catch (error) {
        console.error("Failed to purchase storage:", error);
    }
}

// Wait until the DOM is fully loaded to set up event listeners
document.addEventListener("DOMContentLoaded", async () => {
    await loadWeb3(); // Initialize Web3 on page load

    const provideStorageBtn = document.getElementById("provideStorageBtn");
    const purchaseStorageBtn = document.getElementById("purchaseStorageBtn");

    // Only add event listeners if elements exist (i.e., on the dashboard.html page)
    if (provideStorageBtn && purchaseStorageBtn) {
        provideStorageBtn.onclick = provideStorage;
        purchaseStorageBtn.onclick = purchaseStorage;
    }

    // For the initial page to connect MetaMask
    const connectWalletBtn = document.getElementById("connectWalletBtn");
    if (connectWalletBtn) {
        connectWalletBtn.onclick = connectMetaMask;
    }
});