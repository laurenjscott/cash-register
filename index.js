window.addEventListener("load", () => {
	const btnCheckCashRegister = document.querySelector("form button.btn-check-cash-register");
	const btnClearForm = document.querySelector("form button.btn-clear-form");
	const inputArray = [...document.querySelectorAll("input")];

	btnCheckCashRegister.addEventListener("click", (event) => {
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
		checkCashRegister(event, inputPriceValue, inputCashValue, arrayCashInDrawerInput);
	});
	btnClearForm.addEventListener("click", clearForm);
	inputArray.forEach(input => input.addEventListener("input", validateNumberInputs));
	renderCashInDrawerInputs();

	displayUserName();



});

function renderCashInDrawerInputs() {
	const fieldset = document.querySelector("fieldset");
	const wrapper = fieldset.querySelector(".fieldset-input-wrapper");
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
		input.setAttribute("min", "0");
		input.setAttribute("step", ".01");
		input.setAttribute("size", "10");
		label.textContent = currency[0].toLowerCase();
		label.setAttribute("for", input.id);
		label.appendChild(input);
		wrapper.appendChild(label);
	}
	fieldset.appendChild(wrapper);
}


function checkCashRegister(event, price, cash, cid) { //cid is an array

	const isFormValid = validateForm(event);

	if(!isFormValid) {
		return;
	}

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

function validateNumberInputs(event) { //only checks for HTML5 validation pattern errors
	const input = event.currentTarget;
	const isValid = input.checkValidity();
	const isFirefox = /Firefox/.test(navigator.userAgent); //As of Firefox for macOS 129.0, there are two bugs regarding reportValidity. The first is that validaton bubble isn't displayed for the change event even when the input loses focus. So I changed to an input event. The second bug is that the validation message doesn't update when the invalid condition changes while typing. Example: if a message first shows up when an input is cleared and then enters an invalid number, the first validation message is still displayed. Only when the input loses focus, regains it, and adds a character to the invalid data does the message update. reportValidity works properly only when stepping through this function in the debugger, so I'm adding a small delay for Firefox only. Update: this didn't work either. Not going to worry about it since it's obvious a negative number doesn't make sense in the inputs, but leaving this in for documentation.
	if(isValid != true && !isFirefox) {
		input.reportValidity();
	} else {
		setTimeout(input.reportValidity(), 2000);
	}
}

function validateForm(event) {
	const form = event.currentTarget.parentNode;
	const isFormValid = form.checkValidity();
	const enoughCash = validateCustomerHasEnoughCash();
	if(!isFormValid) {
		form.reportValidity();
		return false;
	} else if(!enoughCash) {
		alert("Not enough cash provided by the customer!");
		return false;
	} else {
		return true;
	}
}

function validateCustomerHasEnoughCash() {
	const inputCash = document.querySelector("input#customer-cash");
	const inputPrice = document.querySelector("input#price");
	if(parseFloat(inputCash.value) < parseFloat(inputPrice.value)) {
		return false;
	}
	return true;
}

function displayUserName() {
	const savedUserName = localStorage.getItem("userName");
	const welcomeMessage = document.querySelector(".placeholder-welcome-message");
	if(savedUserName == null) {
		const newUserName = askForUserName();
		if(!newUserName) {
			welcomeMessage.textContent = `Hello Friend!`;
		} else {
			welcomeMessage.textContent = `Hello ${newUserName}!`;
		}
		return;
	}
	welcomeMessage.textContent = `Hello ${savedUserName}!`;

}

function askForUserName() {
	const userName = prompt("Hi, what is your name?");
	//if user provide a name, save to local storage by invoking rememberUserName function
	if(Boolean(userName) != true) {
		return false;
	}
	rememberUserName(userName);
	return userName;
}

function rememberUserName(string) {
	const userName = string;
	localStorage.setItem("userName", userName);
}


// checkCashRegister(19.5, 19.73, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]);
