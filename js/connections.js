let provider = null;
let networks = {
	'flow': {
		'chainId': 0,
		'abt': 2
	},
	'ethereum': {
		'chainId': 1,
		'abt': 12.2
	},
	'polygon': {
		'chainId': 137,
		'abt': 2.2
	}
};

const getJSON = async (url) => {
	let response = fetch(url)
	.then((response) => response.json())
	.then((data) => {
		return data;
	});
	return response;
}

// create and return provider
const getProvider = async (chainId) => {
	let provider;
	if (window.ethereum !== undefined){ // use metamask if available
		provider = await getMetaMaskProvider(chainId);
		provider.type = 'metamask';
	}
	else{ // use default rate-limited providers from ethers.js as fallback
		provider = await getDefaultProvider(chainId);
		provider.type = 'fallback';
	}
	console.log('Created ' + provider.type + ' provider for chainId ' + chainId);
	return provider;
}

// create instance of metamask provider
const getMetaMaskProvider = async (chainId) => {
	let provider;
	try {
		provider = new ethers.BrowserProvider(window.ethereum, 'any'); // 'any' is required on network changes, otherwise error
		if (!(await isNetwork(provider, chainId))){ // switch networks if applicable
			await changeMetaMaskNetwork(provider, chainId);
		}
	} catch (err) {
		console.log(err);
	}
	return provider;
}

const isNetwork = async (provider, required_chainId) => {
	let current_chainId;
	try {
		current_chainId = (await provider.getNetwork()).chainId;
	} catch (err) {
		console.log(err);
	}
	console.log('current_chainId: ' + current_chainId + ', required_chainId: ' + required_chainId);
	return required_chainId == current_chainId ? true : false;
}

// change metamask chainId
const changeMetaMaskNetwork = async (provider, required_chainId) => {
	if (window.ethereum && typeof provider.send === 'function'){ // metamask exists and current provider has send function
		try {
			console.log('Switching network to ' + required_chainId);
			await provider.send("wallet_switchEthereumChain", [{ chainId: ('0x' + required_chainId.toString(16)) }]);
			//window.location.reload(); // reload page on network change
		} catch (err) {
			console.log(err);
		}
	}
}

// create instance of default provider
const getDefaultProvider = async (chainId) => {
	let provider;
	try {
		provider = await (new ethers.getDefaultProvider(chainId));
	} catch (err) {
		console.log(err);
	}
	return provider;
}

const getBlock = async (network, height = null) => {
	let block, timestamp;
	if (network == 'flow'){
		height = height === null ? 'final' : height;
		let url = `https://rest-mainnet.onflow.org/v1/blocks?height=${height}&expand=payload`;
		let blocks = await getJSON(url);
		if (typeof blocks[0] !== 'undefined'){
			block = blocks[0];
			height = parseInt(block.header.height);
			timestamp = (new Date(block.header.timestamp)).getTime();
		}
	}
	else{
		let network_id = typeof networks[network] !== 'undefined' ? networks[network]['chainId'] : null;
		if (network_id){
			if (provider === null){
				provider = false; // set to false immediately to prevent race condition from interval
				provider = await getProvider(network_id);
			}
			if (provider){
				height = height === null ? height : parseInt(height);
				block = await provider.getBlock(height);
				if (block !== null){
					height = block.number;
					timestamp = block.timestamp * 1000;
				}
			}
		}
	}
	console.log('getBlock on ' + network + ' at height ' + height);
	return result = {
		'block': block,
		'height': height,
		'timestamp': timestamp
	};
}