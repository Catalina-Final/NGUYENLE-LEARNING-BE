require("dotenv").config();
const Mailgun = require("mailgun-js");

MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

FROM_EMAIL = "nle20959@gmail.com";
TO_EMAIL = "kupid0yeuai@gmail.com";
console.log({ MAILGUN_API_KEY, MAILGUN_DOMAIN, FROM_EMAIL });

const mailgun = new Mailgun({
  apiKey: MAILGUN_API_KEY,
  domain: MAILGUN_DOMAIN,
});

const data = {
  //Specify email data
  from: FROM_EMAIL,
  //The email to contact
  to: TO_EMAIL,
  //Subject and text data
  subject: "Hello from Mailgun",
  html: "<h4>Welcome to the Odiom app</h4>",
};

//Invokes the method to send emails given the above data with the helper library
mailgun.messages().send(data, function (err, body) {
  //If there is an error, render the error page
  if (err) {
    console.log("got an error: ", err);
  }
  //Else we can greet    and leave
  else {
    console.log(body);
  }
});
