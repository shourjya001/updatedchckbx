function init() {
  // Check if the button exists before proceeding
  var saveCurrencyButton = document.getElementById("savecurrency");
  if (!saveCurrencyButton) return;

  // Attach events (using old and new methods for compatibility)
  saveCurrencyButton.attachEvent? saveCurrencyButton.attachEvent("onclick", handleFormSubmission) : saveCurrencyButton.addEventListener("click", handleFormSubmission);
  saveCurrencyButton.attachEvent? saveCurrencyButton.attachEvent("onkeydown", preventEnterKey) : saveCurrencyButton.addEventListener("keydown", preventEnterKey);

  // Inner functions for handling form submission, error display, success display, and preventing enter key default action
  function handleFormSubmission() {
    var oldCurrency = document.getElementById("oldcurrency")? document.getElementById("oldcurrency").innerHTML : '';
    var newCurrency = document.getElementById("newcurrency")? document.getElementById("newcurrency").value : '';
    var closeComment = document.getElementById("closeComment")? document.getElementById("closeComment").value : '';
    var htmlDiv = document.getElementById("htmldiv");

    // Validation checks
    if (oldCurrency && oldCurrency === newCurrency) {
      showError("Warning! Old and new currencies are the SAME. Please choose a different currency.", htmlDiv);
      return;
    }
    if (!closeComment) {
      showError("Please provide your comments.", htmlDiv);
      return;
    }

    // Get selected CF Level
    var cfLevelRadios = document.getElementsByName("codType");
    var cfLevel = '';
    for (var i = 0; i < cfLevelRadios.length; i++) {
      if (cfLevelRadios[i].checked) {
        cfLevel = cfLevelRadios[i].value;
        break;
      }
    }

    // Get group code
    var groupCode = '';
    var sgrCodeSelect = document.getElementById("selectsgr_code");
    var leCodeSelect = document.getElementById("selectle_code");
    if (sgrCodeSelect && sgrCodeSelect.value) {
      groupCode = "&sub_group_code=" + sgrCodeSelect.value;
    } else if (leCodeSelect && leCodeSelect.value) {
      groupCode = "&le_code=" + leCodeSelect.value;
    }

    // Check which type of operation (regular or currency-only)
    var regularRadios = document.getElementsByName("codtype_cdt");
    var currencyOnlyRadios = document.getElementsByName("codtype_cdt_nocur");
    var selectedType = '';
    for (var i = 0; i < regularRadios.length; i++) {
      if (regularRadios[i].checked) {
        selectedType = regularRadios[i].value;
        break;
      }
    }
    if (!selectedType) {
      for (var i = 0; i < currencyOnlyRadios.length; i++) {
        if (currencyOnlyRadios[i].checked) {
          selectedType = currencyOnlyRadios[i].value;
          break;
        }
      }
    }
    var isOnlyCurrency = false;
    if (selectedType && currencyOnlyRadios) {
      for (var i = 0; i < currencyOnlyRadios.length; i++) {
        if (currencyOnlyRadios[i].value === selectedType) {
          isOnlyCurrency = true;
          break;
        }
      }
    }

    if (!selectedType) {
      showError("Please select a credit file type.", htmlDiv);
      return;
    }

    var data = "searchType=saveCurrency&CF_Level=" + encodeURIComponent(cfLevel) +
               "&codUsr=" + (document.getElementById("codUsr")? document.getElementById("codUsr").value : '') +
               "&codtype_cdt=" + encodeURIComponent(selectedType) +
               "&oldcurrency=" + encodeURIComponent(oldCurrency) +
               "&newcurrency=" + encodeURIComponent(newCurrency) +
               "&closeComment=" + encodeURIComponent(closeComment) +
               (isOnlyCurrency? "&isOnlyCurrency=true" : '') +
               (groupCode? groupCode : '');

    // AJAX Request (using XMLHttpRequest for compatibility)
    var xhr = window.XMLHttpRequest? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", "dbe_cfl_ModifyCurrency_Save.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var response = xhr.responseText;
            if (response.indexOf('success')!== -1) {
              showSuccess("Successfully Updated.", htmlDiv);
              setTimeout(function() { location.reload(true); }, 1500);
            } else {
              showError("Failed to update Currency conversion. Please check with Admin Team.", htmlDiv);
            }
          } catch (e) {
            showError("Failed to process server response.", htmlDiv);
          }
        } else {
          showError("Request failed. Please try again.", htmlDiv);
        }
      }
    };
    xhr.send(data);
  }

  function preventEnterKey(e) {
    var evt = e || window.event;
    var key = evt.keyCode || evt.which;
    if (key === 13) {
      if (evt.preventDefault) {
        evt.preventDefault();
      } else {
        evt.returnValue = false;
      }
    }
  }

  function showError(message, htmlDiv) {
    if (htmlDiv) {
      htmlDiv.innerHTML = message;
      htmlDiv.className = "reddiv";
    }
    alert(message);
  }

  function showSuccess(message, htmlDiv) {
    if (htmlDiv) {
      htmlDiv.innerHTML = message;
      htmlDiv.className = "tddiv greendiv";
    }
    alert(message);
  }
}
