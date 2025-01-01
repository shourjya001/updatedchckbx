// getBasicDetails.js
function getBasicDetails(type, codspm, codstatus, isOnlyCurrency) {
    codstatus = codstatus || '';
    var xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            try {
                var response = JSON.parse(xmlhttp.responseText);
                
                if (response.id === 'None') {
                    var codtypeInputs = document.getElementsByName('codtype_cdt');
                    codtypeInputs.forEach(input => {
                        input.disabled = true;
                        input.checked = false;
                    });
                    document.getElementById('oldcurrency').innerHTML = "";
                    alert("No credit files available!");
                    return;
                }
                
                var first = 0;
                var newarr = [25, 26];
                
                response.forEach(item => {
                    newarr = newarr.filter(status => status !== parseInt(item.CODSTATUS));
                    
                    if (first === 0) {
                        document.getElementById('oldcurrency').innerHTML = item.CODCUR;
                        var codtypeInputs = document.getElementsByName('codtype_cdt');
                        codtypeInputs.forEach(input => {
                            if (parseInt(input.value) === parseInt(item.CODSTATUS)) {
                                input.checked = true;
                                input.disabled = false;
                            }
                        });
                        first++;
                    }
                    
                    var codtypeInputsAll = document.getElementsByName('codtype_cdt');
                    codtypeInputsAll.forEach(input => {
                        if (parseInt(input.value) === parseInt(item.CODSTATUS)) {
                            input.disabled = false;
                        }
                    });
                });
                
                if (newarr.length > 0 && codstatus === '') {
                    var codtypeInputsAgain = document.getElementsByName('codtype_cdt');
                    codtypeInputsAgain.forEach(input => {
                        if (parseInt(input.value) === newarr[0]) {
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
