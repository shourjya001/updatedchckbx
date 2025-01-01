// getCFdetails.js
function getCFdetails(codstatus, isOnlyCurrency = false) {
    var searchString = '';
    var selectSgrCode = document.getElementById("selectsgr_code");
    var selectLeCode = document.getElementById("selectle_code");
    
    if (selectSgrCode && selectSgrCode.value !== '') {
        searchString = selectSgrCode.value;
    } else if (selectLeCode && selectLeCode.value !== '') {
        searchString = selectLeCode.value;
    }
    
    if (searchString !== '') {
        getBasicDetails('', searchString, codstatus, isOnlyCurrency);
    }
}
