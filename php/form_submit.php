<?php

// Set parameters and execute
$email = $_POST['email'];
$pid = $_POST['pid'];

$shirts = $_POST['shirt'];
$sweatshirts = $_POST['sweatshirt'];
$pants = $_POST['pants'];
$other = $_POST['other'];

// double check PID is AXXXXXXXX
if (preg_match("/^A[0-9]{8}$/", $pid) == 0) {
    echo "Invalid PID";
    return;
}

// Ensure email is valid
if (preg_match("/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/", $email) == 0) {
    echo "Bad email";
    return;
}

// Other error handling already done in JS
$donationDB = fopen("../db/DonationDB.csv", "a");
fwrite($donationDB,"\n$email,$pid,$shirts,$sweatshirts,$pants,$other");
fclose($donationDB);

echo "Record added successfully"

?>