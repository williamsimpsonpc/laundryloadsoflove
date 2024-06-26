function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

var which_database = "invalid";

var sheetdb = "https://sheetdb.io/api/v1/ctndyj1xuv0wr";

function writeData(email, pid, shirt, sweatshirt, pants, other) {
    if (which_database == "invalid" || which_database == "invalid-bad-hall") {
        return new Promise((resolve, reject) => {
            resolve({ created: 0 });
        });
    }

    return fetch(sheetdb, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: [
                {
                    'ID': "INCREMENT",
                    'EMAIL': email,
                    'PID': pid,
                    'SHIRTS': shirt,
                    'SWEATSHIRTS': sweatshirt,
                    'PANTS': pants,
                    'OTHER': other,
                    'DATE': "DATETIME",
                    'HALL': which_database
                }
            ]
        })
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        });
}

async function readData() {
    const response = await fetch(sheetdb);
    const data = await response.json();
    return data;
}

function validateForm(event) {
    event.preventDefault();

    var response = document.getElementById('formResponse');

    // make sure the database is valid
    if (which_database == "invalid" || which_database == "invalid-bad-hall") {
        response.innerHTML = "Invalid hall! Try scanning the QR code again.";
        response.style.color = "red";

        return false;
    }

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

    // Convert all values to numbers (just in case they're empty strings or something else)
    numShirts.value = parseInt(numShirts.value);
    numSweatshirts.value = parseInt(numSweatshirts.value);
    numPants.value = parseInt(numPants.value);
    numOther.value = parseInt(numOther.value);

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
        // if pid isn't empty, it's an error
        if (pid.value != "") {
            pid_label.innerHTML = "PID: <span class='required'>*</span>";
            pid.style.border = "2px solid red";
            error = true;
        }
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

    // Write the data to the Google Sheets database
    writeData(email.value, pid.value, numShirts.value, numSweatshirts.value, numPants.value, numOther.value)
        .then((data) => {
            // data should be a json object with a "created" property that is 1
            console.log("Response: ", data);
            if (data.created == 1) {
                // Display a success message
                response.innerHTML = "Donation submitted successfully!";
                response.style.color = "green";
                form.reset();
            } else {
                // Display an error message
                response.innerHTML = "Error submitting donation. Please try again later.";
                response.style.color = "red";
            }
        });
    

    return true;
}

function parseIntOrZero(n) {
    var parsed = parseInt(n);
    return isNaN(parsed) ? 0 : parsed;
}

const numTopDonors = 10;

function readTopDonors() {
    readData()
        .then((data) => {
            // Access the top donors data
            var topDonors = data;

            var totalDonations = 0;

            var totalDonationsLabel = document.getElementById('totalDonations');

            // Create a list of all the emails with their corresponding amount of all types donated
            var emailDonations = {};
            for (var i = 0; i < topDonors.length; i++) {
                if (emailDonations[topDonors[i].EMAIL] == undefined) {
                    emailDonations[topDonors[i].EMAIL] = 0;
                }
                
                var numDonations = parseIntOrZero(topDonors[i].SHIRTS) + parseIntOrZero(topDonors[i].SWEATSHIRTS) + parseIntOrZero(topDonors[i].PANTS) + parseIntOrZero(topDonors[i].OTHER);
                totalDonations += numDonations;
                emailDonations[topDonors[i].EMAIL] += numDonations;
            }

            // TODO: When we switch to clearing the DB every month, we need to read this from another place
            //       It may be better to just do this manually, once a month.
            totalDonationsLabel.innerHTML = totalDonations;

            // sort the emails by the amount of donations
            var sortedEmails = Object.keys(emailDonations).sort(function(a, b) {
                return emailDonations[b] - emailDonations[a];
            });

            // Load the data into a table
            var table = document.getElementById('donor_table');
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            var size = sortedEmails.length < numTopDonors ? sortedEmails.length : numTopDonors;
            for (var i = 0; i < size; i++) {
                var row = table.insertRow(i + 1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = " " + (i + 1) + ". " + sortedEmails[i].split('@')[0];
                cell2.innerHTML = emailDonations[sortedEmails[i]];
            }

            if (sortedEmails.length < 5) {
                var row = table.insertRow(sortedEmails.length + 1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = "This could be you!";
                cell2.innerHTML = "...";
            }
        });
}

document.addEventListener('DOMContentLoaded', function() {
    readTopDonors();

    // get the url query (?hall=...) and alert the hall
    var url = new URL(window.location.href);
    var hall = url.searchParams.get('hall');
    if (hall == null) {
        hall = "stewart"; // workaround for existing bins without the ?hall attribute
    }

    var college = "warren";

    var form_text = document.getElementById('halltext');
    switch (hall) {
        case "stewart":
            form_text.innerHTML = "Stewart Hall";
            college = "warren";
            break;
        case "frankfurter":
            form_text.innerHTML = "Frankfurter Hall";
            college = "warren";
            break;
        case "harlan":
            form_text.innerHTML = "Harlan Hall";
            college = "warren";
            break;
        case "goldberg":
            form_text.innerHTML = "Goldberg Hall";
            college = "warren";
            break;
        case "douglas":
            form_text.innerHTML = "Douglas Hall";
            college = "warren";
            break;
        case "brown":
            form_text.innerHTML = "Brown Hall";
            college = "warren";
            break;
        case "brennan":
            form_text.innerHTML = "Brennan Hall";
            college = "warren";
            break;
        case "black":
            form_text.innerHTML = "Black Hall";
            college = "warren";
            break;
        case "bates":
            form_text.innerHTML = "Bates Hall";
            college = "warren";
            break;
        case "brown":
            form_text.innerHTML = "Brown Hall";
            college = "warren";
            break;
        case "campuscenter1":
            form_text.innerHTML = "Campus Center";
            college = "revelle";
            break;
        case "librarywalk":
            form_text.innerHTML = "Library Walk";
            college = "librarywalk";
            break;
        default:
            form_text.innerHTML = "Laundry Loads of Love";
            college = "invalid";
            hall = "invalid";
            which_database = "invalid-bad-hall";
            alert("Invalid hall! Try scanning the QR code again.");
            break;
    }

    var form_logo = document.getElementById('collegelogo');

    if (college == "invalid") {
        form_logo.src = "images/ucsd.svg";
    } else {
        form_logo.src = "images/" + college + ".png";
    }

    form_text.innerHTML = form_text.innerHTML + " Smart Bin Form";

    if (which_database == "invalid-bad-hall") {
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

        // disable the form (disabled="disabled")
        form.setAttribute("disabled", "disabled");
        email.setAttribute("disabled", "disabled");
        pid.setAttribute("disabled", "disabled");
        full[0].setAttribute("disabled", "disabled");
        full[1].setAttribute("disabled", "disabled");
        tc.setAttribute("disabled", "disabled");
        updates.setAttribute("disabled", "disabled");
        numShirts.setAttribute("disabled", "disabled");
        numSweatshirts.setAttribute("disabled", "disabled");
        numPants.setAttribute("disabled", "disabled");
        numOther.setAttribute("disabled", "disabled");

        return;
    }

    which_database = hall;
});