<?php

// Function to read CSV file and process data
function processDonors($csvFilePath, $cacheFilePath) {
    $donors = [];

    // Check if the cache file exists and is less than 30 minutes old
    if (file_exists($cacheFilePath)) {
        $cacheFileTime = filemtime($cacheFilePath);
        $timeDifference = time() - $cacheFileTime;

        if ($timeDifference < 1800) { // 1800 seconds = 30 minutes
            // Read from cache file
            $donors = json_decode(file_get_contents($cacheFilePath), true);
            echo json_encode(['topDonors' => $donors]);
            return;
        }
    }

    // Check if the CSV file exists
    if (!file_exists($csvFilePath)) {
        echo json_encode(['error' => 'CSV file not found']);
        return;
    }

    // Read CSV file
    $file = fopen($csvFilePath, 'r');
    while (($data = fgetcsv($file)) !== false) {
        $email = $data[0];
        $numDonations = 0;

        // if the email is 'Email' then skip the row
        if ($email == 'Email') {
            continue;
        }

        // if any of the data are null, set them to 0
        for ($i = 2; $i < 6; $i++) {
            if ($data[$i] == null) {
                $data[$i] = 0;
            }

            // log data to server console
            // for debugging purposes
            error_log("GOT A VALUE: data[$i]: " . $data[$i]);
            
            $numDonations += $data[$i];
        }

        // Initialize donor if not exists
        if (!isset($donors[$email])) {
            $donors[$email] = [];
            $donors[$email]['count'] = 0;
        }

        $donors[$email]['count'] += $numDonations;
    }

    fclose($file);

    // Sort donors by donation count in descending order
    arsort($donors);

    // Output the top 5 donors and their donation counts
    $topDonors = [];
    $counter = 0;
    foreach ($donors as $email => $donorData) {
        $topDonors[] = [
            'email' => $email,
            'totalDonations' => $donorData['count']
        ];

        $counter++;
        if ($counter >= 5) {
            break; // Stop after the top 5 donors
        }
    }

    // Write to cache file
    file_put_contents($cacheFilePath, json_encode($topDonors));

    echo json_encode(['topDonors' => $topDonors]);
}

// Set the CSV file path
$csvFilePath = "../db/DonationDB.csv";
$cacheFilePath = "../db/DonationDBCache.json";

// Call the function to process and output the top 5 donors
processDonors($csvFilePath, $cacheFilePath);

?>
