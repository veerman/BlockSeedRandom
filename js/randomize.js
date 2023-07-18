const getHexStrings = (data, allowed_keys = []) => {
	let hex_strings = [];
	Object.keys(data).forEach((key, index) => {
		if (typeof data[key] === 'object'){
			hex_strings = hex_strings.concat(getHexStrings(data[key], allowed_keys));
		}
		else{
			if (allowed_keys.includes(key) || allowed_keys.length === 0){
				let matches = data[key].toString().match(/^(0x)?[0-9a-fA-F]{40,}$/); // only use hex strings that are at least 40 characters long
				if (matches){
					hex_strings.push(matches[0].replace(/^0x/, '')); // add to array, remove 0x prefix if necessary
				}
			}
		}
	});
	return hex_strings;
}

const getShuffledSubstrings = (hex_strings) => {
	// normalize data
	hex_strings = hex_strings.map(str => str.toLowerCase()); // convert to lowercase
	hex_strings.sort(); // sort

	let text = hex_strings.join(''); // join all strings

	// introduce basic shuffling to text
	const rotations = hex_strings.length; // number of characters to rotate/shift string
	text = text.slice(rotations) + text.slice(0, rotations);
	let substrings = cutString(text, 32);
	for (let i = 0; i < rotations; i++){
		substrings.push(substrings.shift());
	}
	return substrings;
}

const cutString = (string, num_substrings) => {
	const num_chars = string.length / num_substrings;
	let substrings = [];
	for (let i = 0; i < num_substrings; i++) {
		substrings.push(string.substr(i * num_chars, num_chars));
	}
	return substrings;
}

const sumEvenOdd = (hex_string) => {
	const hex_chars = hex_string.split('');
	let total = 0;
	hex_chars.forEach(char => {
		const decimal_value = parseInt(char, 16);
		total += decimal_value;
	});
	return total % 2 === 0 ? 0 : 1;
}

const frequencyEvenOdd = (hex_string) => {
	const hex_chars = hex_string.split('');
	let count = {
		even: 0,
		odd: 0
	};
	hex_chars.forEach(char => {
		const decimal_value = parseInt(char, 16);
		if (decimal_value % 2 === 0) {
			count.even++;
		} else {
			count.odd++;
		}
	});
	if (count.even === count.odd) {
		count = frequencyEvenOdd(hex_string.slice(0, -1)); // no ties allowed. if even equals odd, remove last character of string and try again
	}
	return count;
}

const shuffleList = (items, seed, num_shuffles) => {
	let rng = new Math.seedrandom(seed);
	num_shuffles = num_shuffles ? num_shuffles : items.length;
	for (let i = 0; i < num_shuffles; i++){
		let results = [];
		while (items.length > 0) {
			const index = Math.floor(rng() * items.length); // get a random index
			const selected = items.splice(index, 1)[0]; // remove the selected string from the array
			results.push(selected); // add the selected string to the results array
		}
		items = results;
	}
	return items;
}
