function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validateForm(event) {
    event.preventDefault();

    var form = document.getElementById('smartBinForm');
    var email = document.getElementById('email');
    var pid = document.getElementById('pid');
    var full = document.getElementsByName('full');
    var tc = document.getElementById('tc');
    var updates = document.getElementById('updates');

    var numShirts = document.getElementById('shirt');
    var numSweatshirts = document.getElementById('sweatshirt');
    var numPants = document.getElementById('pants');
    var numOther = document.getElementById('other');

    var email_label = document.querySelector('label[for="email"]');
    var pid_label = document.querySelector('label[for="pid"]');
    var full_label = document.querySelector('label[for="bin_full"]');
    var tc_label = document.querySelector('label[for="tc"]');
    var updates_label = document.querySelector('label[for="updates"]');

    var numShirts_label = document.querySelector('label[for="numShirts"]');
    var numSweatshirts_label = document.querySelector('label[for="numSweatshirts"]');
    var numPants_label = document.querySelector('label[for="numPants"]');
    var numOther_label = document.querySelector('label[for="numOther"]');

    var error = false;
    if (email.value == "") {
        email_label.innerHTML = "Email: <span class='required'>*</span>";
        email.style.border = "2px solid red";
        error = true;
    } else {
        email_label.innerHTML = "Email:";
        email.style.border = "none";
    }
    if (pid.value == "") {
        pid_label.innerHTML = "PID: <span class='required'>*</span>";
        pid.style.border = "2px solid red";
        error = true;
    } else {
        pid_label.innerHTML = "PID:";
        pid.style.border = "none";
    }
    if (full[0].checked == false && full[1].checked == false) {
        full_label.innerHTML = "Is the bin full? <span class='required'>*</span>";
        error = true;
    } else {
        full_label.innerHTML = "Is the bin full?";
    }

    if (tc.checked == false) {
        tc_label.innerHTML = "I agree to the <a href='terms.html'>Terms and Conditions</a>. <span class='required'>*</span>";
        error = true;
    } else {
        tc_label.innerHTML = "I agree to the <a href='terms.html'>Terms and Conditions</a>.";
    }

    // if any clothing values aren't numbers, set them to 0
    if (isNaN(numShirts.value)) {
        numShirts.value = 0;
    }

    if (isNaN(numSweatshirts.value)) {
        numSweatshirts.value = 0;
    }

    if (isNaN(numPants.value)) {
        numPants.value = 0;
    }

    if (isNaN(numOther.value)) {
        numOther.value = 0;
    }

    // verify that they're donating a sensible amount of clothing
    if (numShirts.value == 0 && numSweatshirts.value == 0 && numPants.value == 0 && numOther.value == 0) {
        numShirts_label.innerHTML = "Number of shirts: <span class='required'>*</span>";
        numSweatshirts_label.innerHTML = "Number of sweatshirts: <span class='required'>*</span>";
        numPants_label.innerHTML = "Number of pants: <span class='required'>*</span>";
        numOther_label.innerHTML = "Number of other items: <span class='required'>*</span>";
        error = true;
    }

    // ensure PID is in format AXXXXXXXX
    if (pid.value.length != 9 || pid.value[0] != 'A' || isNaN(pid.value.substring(1))) {
        pid_label.innerHTML = "PID: <span class='required'>*</span>";
        pid.style.border = "2px solid red";
        error = true;
    }

    // ensure email is an email
    if (!validateEmail(email.value)) {
        email_label.innerHTML = "Email: <span class='required'>*</span>";
        email.style.border = "2px solid red";
        error = true;
    }

    if (error) {
        return false;
    }

    var response = document.getElementById('formResponse');

    // run .php file to update database
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "php/form_submit.php", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("pid=" + pid.value + "&email=" + email.value + "&shirt=" + numShirts.value + "&sweatshirt=" + numSweatshirts.value + "&pants=" + numPants.value + "&other=" + numOther.value);
    // if the response isn't "Record added successfully", display an error message
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (xhr.responseText != "Record added successfully") {
                if (xhr.responseText == "Error: Invalid donation type") {
                    response.innerHTML = "Error submitting donation. Invalid donation type.";
                } else {
                    console.log(xhr.responseText);
                    response.innerHTML = "Error submitting donation. Please try again later.";
                    response.style.color = "red";
                }
            } else {
                response.innerHTML = "Donation submitted successfully!";
                response.style.color = "green";
                form.reset();
            }
        }
    };

    return true;
}

function readTopDonors() {
    // Make an XHR request to the PHP script
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../php/count_donors.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Parse the JSON response
            var response = JSON.parse(xhr.responseText);

            // Check for errors
            if (response.error) {
                console.error('Error: ' + response.error);
            } else {
                // Access the top donors data
                var topDonors = response.topDonors;

                // Load the data into a table
                console.log(topDonors);
                
                var table = document.getElementById('donor_table');
                while (table.rows.length > 1) {
                    table.deleteRow(1);
                }
                for (var i = 0; i < topDonors.length; i++) {
                    var row = table.insertRow(i + 1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    cell1.innerHTML = " " + (i + 1) + ". " + topDonors[i].email;
                    cell2.innerHTML = topDonors[i].totalDonations;
                }

                if (topDonors.length < 5) {
                    var row = table.insertRow(topDonors.length + 1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    cell1.innerHTML = "This could be you!";
                    cell2.innerHTML = "...";
                }
            }
        }
    };

    // Send the XHR request (assuming no data needs to be sent)
    xhr.send();
}

// run readTopDonors() when the page loads
window.onload = readTopDonors;