function getBasicDetails(type, codspm, codstatus, isOnlyCurrency) {
    codstatus = codstatus || '';
    var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            try {
                var response = JSON.parse(xmlhttp.responseText);
                
                // Get both groups of radio buttons
                var creditFileRadios = document.querySelectorAll('input[name="codtype_cdt"]');
                var currencyOnlyRadios = document.querySelectorAll('input[name="codtype_cdt_nocur"]');
                
                if (response.id === 'None') {
                    // Disable all radio buttons in both groups
                    creditFileRadios.forEach(input => {
                        input.disabled = true;
                        input.checked = false;
                    });
                    currencyOnlyRadios.forEach(input => {
                        input.disabled = true;
                        input.checked = false;
                    });
                    document.getElementById('oldcurrency').innerHTML = "";
                    alert("No credit files available!");
                    return;
                }
                
                var first = 0;
                var newarr = [25, 26];
                
                // Enable appropriate radio buttons based on response
                response.forEach(item => {
                    newarr = newarr.filter(status => status !== parseInt(item.CODSTATUS));
                    
                    if (first === 0) {
                        document.getElementById('oldcurrency').innerHTML = item.CODCUR;
                        
                        // Handle both groups
                        const targetRadios = isOnlyCurrency ? currencyOnlyRadios : creditFileRadios;
                        targetRadios.forEach(input => {
                            if (parseInt(input.value) === parseInt(item.CODSTATUS)) {
                                input.checked = true;
                                input.disabled = false;
                            }
                        });
                        first++;
                    }
                    
                    // Enable corresponding radio buttons in both groups
                    const status = parseInt(item.CODSTATUS);
                    creditFileRadios.forEach(input => {
                        if (parseInt(input.value) === status) {
                            input.disabled = false;
                        }
                    });
                    currencyOnlyRadios.forEach(input => {
                        if (parseInt(input.value) === status) {
                            input.disabled = false;
                        }
                    });
                });
                
                if (newarr.length > 0 && codstatus === '') {
                    const disableStatus = newarr[0];
                    creditFileRadios.forEach(input => {
                        if (parseInt(input.value) === disableStatus) {
                            input.disabled = true;
                        }
                    });
                    currencyOnlyRadios.forEach(input => {
                        if (parseInt(input.value) === disableStatus) {
                            input.disabled = true;
                        }
                    });
                }
            } catch (e) {
                alert("Error parsing JSON response: " + e.message);
            }
        }
    };

    var params = "searchType=FetchCFdetails&searchString=" + encodeURIComponent(codspm) + 
                 "&codstatus=" + encodeURIComponent(codstatus) +
                 "&isOnlyCurrency=" + encodeURIComponent(isOnlyCurrency);
    
    xmlhttp.open("POST", "dbe_cfl_ModifyCurrency_Save.php", true);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlhttp.send(params);
}
