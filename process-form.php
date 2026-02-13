<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // CONFIGURATION
    // Recipient email address
    $recipient_email = "brantleycreative@gmail.com"; 
    
    // This should be an email address on your domain to avoid spam filters
    $sender_email = "noreply@virginiacityfarmacy.com"; 

    // 1. SANITIZE INPUTS
    $name = strip_tags(trim($_POST["name"]));
    
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

    // 4. PREPARE EMAIL CONTENT
    $subject = "VCFarmacy Form Submission from $name";
    
    $email_content = "Name: $name\n";
    if (!empty($business_name)) {
        $email_content .= "Business Name: $business_name\n";
    }
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n\n";
    $email_content .= "Message:\n$message\n";

    // 5. SEND EMAIL USING PHPMAILER
    $mail = new PHPMailer(true);

    try {
        // Server settings
        // To use SMTP, uncomment the lines below and fill in your SMTP details
        /*
        $mail->isSMTP();                                            
        $mail->Host       = 'smtp.example.com';                     
        $mail->SMTPAuth   = true;                                   
        $mail->Username   = 'user@example.com';                     
        $mail->Password   = 'secret';                               
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         
        $mail->Port       = 587;                                    
        */

        // Recipients
        $mail->setFrom($sender_email, 'Virginia City Farmacy Website');
        $mail->addAddress($recipient_email);     
        $mail->addReplyTo($email, $name);

        // Content
        $mail->isHTML(false);                                  
        $mail->Subject = $subject;
        $mail->Body    = $email_content;

        $mail->send();
        header("Location: thank-you.html");
        exit;
    } catch (Exception $e) {
        echo "<h1>Error</h1><p>The server could not send the email. Mailer Error: {$mail->ErrorInfo}</p>";
    }

} else {
    // Redirect back to contact page if accessed directly
    header("Location: contact.html");
    exit;
}
?>
