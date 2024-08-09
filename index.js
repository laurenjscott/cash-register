window.addEventListener("load", () => {
	const btnCheckCashRegister = document.querySelector("form button.btn-check-cash-register");
	const btnClearForm = document.querySelector("form button.btn-clear-form");
	renderCashInDrawerInputs();
	btnCheckCashRegister.addEventListener("click", () => {
		const inputCashValue = document.querySelector("#customer-cash").value;
		const inputPriceValue = document.querySelector("#price").value;
		const inputsCashInDrawerFieldset = document.querySelectorAll("fieldset input");
		const arrayCashInDrawerInput = [];
		for(input of inputsCashInDrawerFieldset) {
			let denominationArray = [];
			denominationArray.push(input.id);
			denominationArray.push(Number(input.value));
			arrayCashInDrawerInput.push(denominationArray);
		}
		checkCashRegister(inputPriceValue, inputCashValue, arrayCashInDrawerInput);
	});
	btnClearForm.addEventListener("click", clearForm);

	const inputArray = [...document.querySelectorAll("input")];
	inputArray.forEach(input => input.addEventListener("change", validateNumberInputs))


});

function renderCashInDrawerInputs() {
	const fieldset = document.querySelector("fieldset");
	const currencyDictionary = [
		["ONE HUNDRED", 100],
		["TWENTY", 20],
		["TEN", 10],
		["FIVE", 5],
		["ONE", 1],
		["QUARTER", 0.25],
		["DIME", 0.1],
		["NICKEL", 0.05],
		["PENNY", 0.01]
	]; 

	for(currency of currencyDictionary) {
		let input = document.createElement("input");
		let label = document.createElement("label");
		input.type = "number";
		input.id = currency[0];
		input.setAttribute("min", "0")
		label.textContent = currency[0];
		label.setAttribute("for", input.id);
		label.appendChild(input);
		fieldset.appendChild(label);

	}
}


function checkCashRegister(price, cash, cid) { //cid is an array
	const resultPara = document.querySelector(".result-paragraph");

	const currencyDictionary = [
		["ONE HUNDRED", 100],
		["TWENTY", 20],
		["TEN", 10],
		["FIVE", 5],
		["ONE", 1],
		["QUARTER", 0.25],
		["DIME", 0.1],
		["NICKEL", 0.05],
		["PENNY", 0.01]
	];

	const totalInDrawer = cid.reduce(
		(totalInDrawer, currency) => totalInDrawer + currency[1],
		0
	);

    
    let changeOwed = cash - price;

	

	//placeholder for function return value;
    const totalChangeReturnedArray = [];
	const statusObj = { status: undefined, change: totalChangeReturnedArray };
	

	if(totalInDrawer < changeOwed) {
		statusObj.status = "INSUFFICIENT_FUNDS";
		resultPara.textContent = JSON.stringify(statusObj);
		resultPara.classList.add("display");
		return;
	}
    
	for (let currency of cid) {
		let currencyDenominationString = currency[0]; //e.g. "PENNY"
		let currencyDrawerTotal = currency[1]; //e.g. "1.01"
		let currencyDictionaryAmount = currencyDictionary.find(
			(dict) => dict[0] == currencyDenominationString
		)[1]; //e.g. "0.01"
		let i = (currencyDrawerTotal / currencyDictionaryAmount).toFixed(0); //total of currency items for current demonination in drawer. Example: returns "101" if there are $1.01 of pennies in drawer
		console.info(currencyDictionaryAmount);
		console.group(`${currency[0]}`);
		console.info(`"i" variable value is ${i}`);
		console.info(`Currency name: ${currency[0]}`);
		console.info(`Currency amount in dollars: ${currencyDictionaryAmount}`);
		console.info(
			`Total of currency in drawer: ${new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD"
			}).format(currencyDrawerTotal)}`
		);
		console.info(
			`Currency ${currencyDenominationString}: loop up to ${i} times. This is done via the inner loop below.`
		);
		for (let j = 0; j < i; j++) {
			if (changeOwed - currencyDictionaryAmount < 0 && j == 0) { // if change owed minus the value of the current demomination is a negative number AND if this is the first run of the inner loop, then no money is removed from the drawer for this denomination. Inner loop is stopped immediately
				console.warn(`No money was removed of this currency.`);
				break;
			}
			if (changeOwed - currencyDictionaryAmount >= 0) { //if change owed minus the value of the current demomination is greater than 0,....
				changeOwed = (changeOwed - currencyDictionaryAmount).toFixed(2); // ...decrement changeOwed variable by the the value of the current demomination. This is the equivalent of given the customer a single coin or bill.
				console.info(`I owe you: ${changeOwed}`); //Equivalent of telling customer what they were just given
				if (j + 1 == i) { //for example, if this is the beginning of inner loop, j = 0, so j + 1 would equal 1. In the example of a penny, the i variable equals 101. "1" does not equal 101, so this condition is not met. On to the next one...
					let totalCurrencyGivenArray = [
						currencyDenominationString,
						(j + 1) * currencyDictionaryAmount
					];
					totalChangeReturnedArray.push(totalCurrencyGivenArray);
					break;
				}
			} else {
				let totalCurrencyGivenArray = [ //["PENNY", 0] if denomination is a penny and if the first run of the inner loop
					currencyDenominationString,
					j * currencyDictionaryAmount
				];
				totalChangeReturnedArray.push(totalCurrencyGivenArray); //update totalChangeReturnedArray variable and exit inner loop
				break;
			}
		}

		console.groupEnd();
	}
	const totalCurrencyGivenSum = totalChangeReturnedArray.reduce((sum, currency) => sum + currency[1], 0);
	if(totalCurrencyGivenSum == totalInDrawer) {
		statusObj.status = "CLOSED";
		statusObj.change = cid;
	}	else if(changeOwed != 0) {
		statusObj.status = "INSUFFICIENT_FUNDS";
		statusObj.change = [];
	}	else {
		statusObj.status = "OPEN";
	}
	
	resultPara.classList.add("display")
	resultPara.textContent = JSON.stringify(statusObj);
	return statusObj;
}

function clearForm() {
	this.form.reset();
	//hide result paragraph after clearing the text content
	const resultPara = this.form.parentNode.querySelector(".result-paragraph");
	resultPara.textContent = "";
	resultPara.classList.remove("display");
}

function validateNumberInputs(event) {
	const input = event.currentTarget;
	const isValid = input.validity.valid;
	console.info(input);
	if(isValid != true) {
		alert("Hello World!");
		input.reportValidity();
	}
}


// checkCashRegister(19.5, 19.73, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]);
