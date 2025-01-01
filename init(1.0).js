function init() {
    var saveCurrencyButton = document.getElementById("savecurrency");
    if (!saveCurrencyButton) return;

    saveCurrencyButton.onmousedown = handleSaveCurrency;
    saveCurrencyButton.onkeydown = function(e) {
        if ((e.which || e.keyCode) === 13) {
            e.preventDefault();
        }
    };
}

function handleSaveCurrency() {
    const oldCurrency = document.getElementById("oldcurrency")?.innerHTML || '';
    const newCurrency = document.getElementById("newcurrency")?.value || '';
    const closeComment = document.getElementById("closeComment")?.value || '';
    const htmlDiv = document.getElementById("htmldiv");

    // Validation checks
    if (oldCurrency && oldCurrency === newCurrency) {
        showError("Warning! Old and new currencies are the SAME. Please choose a different currency.");
        return;
    }
    
    if (!closeComment) {
        showError("Please provide your comments.");
        return;
    }

    // Get selected CF Level
    const radios = document.getElementsByName("codType");
    const selects = Array.from(radios).find(radio => radio.checked)?.value || '';

    // Get group code
    let group_1 = '';
    const sgrCode = document.getElementById("selectsgr_code");
    const leCode = document.getElementById("selectle_code");
    
    if (sgrCode?.value) {
        group_1 = `&sub_group_code=${sgrCode.value}`;
    } else if (leCode?.value) {
        group_1 = `&le_code=${leCode.value}`;
    }

    // Check which type of operation (regular or currency-only)
    const regularRadios = document.getElementsByName("codtype_cdt");
    const currencyOnlyRadios = document.getElementsByName("codtype_cdt_nocur");
    
    let selectedType = '';
    let isOnlyCurrency = false;

    // Check regular radios first
    selectedType = Array.from(regularRadios).find(radio => radio.checked)?.value;
    
    // If no regular radio selected, check currency-only radios
    if (!selectedType) {
        selectedType = Array.from(currencyOnlyRadios).find(radio => radio.checked)?.value;
        isOnlyCurrency = !!selectedType;
    }

    if (!selectedType) {
        showError("Please select a credit file type.");
        return;
    }

    const data = {
        searchType: 'saveCurrency',
        CF_Level: selects,
        codUsr: document.getElementById("codUsr")?.value || '',
        codtype_cdt: selectedType,
        oldcurrency: oldCurrency,
        newcurrency: newCurrency,
        closeComment: closeComment,
        isOnlyCurrency: isOnlyCurrency
    };

    if (group_1) {
        const [key, value] = group_1.substring(1).split('=');
        data[key] = value;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "dbe_cfl_ModifyCurrency_Save.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.id === 'success') {
                    showSuccess("Successfully Updated.");
                    setTimeout(() => location.reload(true), 1500);
                } else {
                    showError("Failed to update Currency conversion. Please check with Admin Team.");
                }
            } catch (e) {
                showError("Failed to process server response.");
            }
        }
    };

    xhr.send(new URLSearchParams(data).toString());
}

function showError(message) {
    const htmlDiv = document.getElementById("htmldiv");
    if (htmlDiv) {
        htmlDiv.innerHTML = message;
        htmlDiv.className = "reddiv";
    }
    alert(message);
}

function showSuccess(message) {
    const htmlDiv = document.getElementById("htmldiv");
    if (htmlDiv) {
        htmlDiv.innerHTML = message;
        htmlDiv.className = "tddiv greendiv";
    }
    alert(message);
}
