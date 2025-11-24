<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- CONFIGURATION ---
    $recipient_email = "brantleycreative@gmail.com"; 
    $sender_email    = "no-reply@virginiacityfarmacy.com"; 
    
    // RECAPTCHA SECRET KEY (Get this from Google Admin Console)
    $recaptcha_secret = "6LcWIxYsAAAAAMrJh187Lq-4r_ege4FLtBqn70J9"; 
    // ---------------------

    // 1. CHECK RECAPTCHA
    if (isset($_POST['g-recaptcha-response']) && !empty($_POST['g-recaptcha-response'])) {
        
        $verify_url = "https://www.google.com/recaptcha/api/siteverify";
        $data = [
            'secret' => $recaptcha_secret,
            'response' => $_POST['g-recaptcha-response']
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $verify_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $response_data = json_decode($response);

        if (!$response_data->success) {
            die("reCAPTCHA verification failed. Please try again.");
        }
    } else {
        die("Please check the captcha box.");
    }

    // 2. SANITIZE DATA
    $name = strip_tags(trim($_POST["name"]));
    // SECURITY PATCH: Remove newlines to prevent Header Injection attacks
    $name = str_replace(array("\r","\n"), array(" "," "), $name);
    
    $business_name = "";
    if (isset($_POST["business_name"])) {
        $business_name = strip_tags(trim($_POST["business_name"]));
        $business_name = str_replace(array("\r","\n"), array(" "," "), $business_name);
    }

    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    
    // Clean phone number (remove tags)
    $phone = strip_tags(trim($_POST["phone"]));

    // SECURITY PATCH: Convert special characters to HTML entities
    $message = htmlspecialchars(trim($_POST["message"]));

    // 3. VALIDATE EMAIL
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format. Please <a href='contact.html'>go back</a>.";
        exit;
    }

    // 4. PREPARE EMAIL
    $subject = "New Contact: $name";
    
    $email_content = "Name: $name\n";
    if (!empty($business_name)) {
        $email_content .= "Business Name: $business_name\n";
    }
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n\n"; // Added Phone here
    $email_content .= "Message:\n$message\n";

    // Headers
    $headers = "From: $sender_email\r\n";
    // This line ensures the 'Reply-To' is the user's email address
    $headers .= "Reply-To: $email\r\n"; 
    $headers .= "X-Mailer: PHP/" . phpversion();

    // 5. SEND AND REDIRECT
    if (mail($recipient_email, $subject, $email_content, $headers)) {
        header("Location: thank-you.html");
        exit;
    } else {
        echo "<h1>Error</h1><p>The server could not send the email.</p>";
    }

} else {
    header("Location: contact.html");
    exit;
}
?>