
// NOTE: the touch globals here are meant to count the number of operations performed to give some concept of realized O() instead of just runtime, 
// as runtime is influenced by a number of factors, though I tried to stay consistent in these factors, declared as globals bc recursion
let linearTouches = 0;
let binaryTouches = 0;
let mergeTouches = 0;



/*
	Question 1, count duplicates in array in linear time
	simple and reliable method with O(N) time complexity

	Iterate the objects, store them as keys in an object and
	add 1 to the value at that key on each encounter
*/

// reduce array to object containing elements as keys and counts as values
function countDupesLinear(arr) {
	return arr.reduce((counts, el) => {
		linearTouches += 1;
		// set count to current count (or 0 if not set) + 1
		counts[el] = (counts[el] || 0) + 1;
		return counts;
	}, {});
}



/*
	Question 2, count duplicates in sorted array in better than linear time,
	key here is to take advantage of the sorted array to remove the need to touch all elements. 
	Made two attempts with a similar idea to take advantage of binary search's O(logN) time complexity.

	Methods here are not sensitive to N but are instead sensitive to the number
	of unique elements, henceforth M.
*/


/*
	Attempt 1: Uses binary search on every unique element.
	This method assumes elements are sorted and simple comparsions are possible between elements. 
	Uses two functions, one to find the last index of a given element and one to iterate the 
	unique elements and build the counts from the found last index
	time complexity is roughly O(M + MlogN), but runs better since N reduces as we iterate over uniques.
	But general explanation: the runtime of the binary search is logN and it needs to be run M times, 
	and M additional operations need to be performed to keep count and iterate
*/

// helper method that implements binary search to find last index of a target element
// assumes that the element is in the array
function findLastIdx(arr, target, lIdx, hIdx, isAsc) {
	binaryTouches += 1;
	// get middle index between high and low indices
	const mIdx = Math.floor((lIdx + hIdx) / 2);
	if (arr[mIdx] === target && (mIdx === arr.length - 1 || target !== arr[mIdx + 1])) {
	// if the middle item equals target AND either we're at the end OR the target is not equal to the next item
		// found last index, break recursion and return mid index
		return mIdx;
	} else if ((isAsc && target < arr[mIdx]) || target > arr[mIdx]) {
	// else if ascending and the target is less than the middle item or not ascending and the target is greater than the middle item
		// recursively search left half of the array
		return findLastIdx(arr, target, lIdx, mIdx - 1, isAsc);
	} else {
	// else recursively search the right half of the array
		return findLastIdx(arr, target, mIdx + 1, hIdx, isAsc);
	}
}

// main method that iterates the unique elements and calls helper to get last idx of each unique element and keep counts
function countDupesBinary(arr) {
	// declare loop counter / idx tracker and count storage object
	let idx = 0;
	const counts = {};
	// check the sort
	const isAsc = arr[0] < arr[arr.length - 1];
	while (idx < arr.length) {
		binaryTouches += 1;
		// get the element
		const el = arr[idx];
		// get last index of element at current idx and add 1 to get next
		const nextIdx = findLastIdx(arr, el, idx, arr.length, isAsc) + 1;
		// set count equal to the next idx minus current idx
		counts[el] = nextIdx - idx;
		// jump to next unique element idx
		idx = nextIdx;
	}
	return counts;
}


/*
	Attempt 2: Uses a merge sort like method to sub divide the array in half until
	the first element in the sub division is equivalent to last element in the subdivision,
	and merges the counts together. The assumptions here are a sorted array
	and that we can make simple equality comparisons between elements.
	Uses two functions but one is simply a friendly entry method.

	Emperically, the best time complexity here (M = 1) is O(1), the worst (M = N) seems to be O(M + N - 1)
	However, at certain range of M / N, it seems to be outperformed by the binary method
	This method's time complexity also seems to be influenced by the element distribution, which makes
	calculating the time complexity challenging. As such, I am unsure of the true time complexity.
*/

// main method that counts duplicates by subdividing array till the first element matches the last
// use mutative methods to reduce space complexity and optimize run time
function _countDupesMerge(arr, lIdx, hIdx, counts) {
	mergeTouches += 1;
	// if the first element in division is the same as the last element, they're all the same, break recursion
	if (arr[lIdx] === arr[hIdx]) {
		// get the element (key)
		const el = arr[lIdx];
		// set count to current count (or 0 if not set) plus new count
		counts[el] = (counts[el] || 0) + hIdx - lIdx + 1;
	} else {
		// get the mid idx
		const mIdx = Math.floor((lIdx + hIdx) / 2);
		// recursively set counts on Left of current division
		_countDupesMerge(arr, lIdx, mIdx, counts);
		// recursively set counts on right of current division
		_countDupesMerge(arr, mIdx + 1, hIdx, counts);
	}
	// return the counts
	return counts;
}

// entry method for dev friendly API
function countDupesMerge(arr) {
	return _countDupesMerge(arr, 0, arr.length - 1, {});
}

/*
	both methods will outperform linear search until M begins to approach N.
	I am not sure it is possible to write a method that outperforms the linear method under this
	approaching M = N scenario, as all items need to be touched in this case and nothing could be quicker
	than straight forward touching them all one by one as all others will carry not useful overhead.
	the best method will depend entirely on the expected M and N parameters.
*/


// testing methods

function resetTouches() {
	linearTouches = 0;
	mergeTouches = 0;
	binaryTouches = 0;
}

function testMethod(fn, arr) {
	const start = new Date().getTime();
	const counts = fn(arr);
	const end = new Date().getTime();
	if (logCounts) {
		console.log('counts: ', counts);
	}
	console.log('runtime: ', end - start);
}

function runTests(arr) {
	resetTouches();

	console.log('linear');
	testMethod(countDupesLinear, arr);
	console.log('touches: ', linearTouches);

	console.log('binary');
	testMethod(countDupesBinary, arr);
	console.log('touches: ', binaryTouches);

	console.log('merge');
	testMethod(countDupesMerge, arr);
	console.log('touches: ', mergeTouches);
}


function main() {
	// test data
	const testArr = ['a','b','b','b','b','b','d','h','h','h','p'];
	// manipulate these to change length (N) and the pool of possible unique elements (M)
	const N = 1000;
	const M = 26;
	const logCounts = true; // change this to not log the counts (if high M)
	const randArr = Array.from({length: N}, () => Math.floor(Math.random() * M)).sort((a1, a2) => a1 - a2);
	// run tests
	runTests(testArr);
	runTests(randArr);
}

main();
