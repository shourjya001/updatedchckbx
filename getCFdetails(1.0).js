function getCFdetails(codstatus, isOnlyCurrency = false) {
    var searchString = '';
    var selectSgrCode = document.getElementById("selectsgr_code");
    var selectLeCode = document.getElementById("selectle_code");
    
    if (selectSgrCode && selectSgrCode.value !== '') {
        searchString = selectSgrCode.value;
    } else if (selectLeCode && selectLeCode.value !== '') {
        searchString = selectLeCode.value;
    }
    
    // Uncheck the other group's radio buttons
    var otherGroupName = isOnlyCurrency ? 'codtype_cdt' : 'codtype_cdt_nocur';
    var otherRadios = document.getElementsByName(otherGroupName);
    otherRadios.forEach(radio => {
        radio.checked = false;
    });
    
    if (searchString !== '') {
        getBasicDetails('', searchString, codstatus, isOnlyCurrency);
    }
}
