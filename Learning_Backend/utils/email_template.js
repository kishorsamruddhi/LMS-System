const frontEndLink = "http://localhost:3000/auth/signup";

const generateEmailVerification = (token) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body, h1, h3, p, div {
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      background-color: #ffffff;
    }
    
    .logo {
      text-align: center;
      color: #000000;
    }
          span {
      color: #ffd74a;
      font-size: 2.2rem;
    }
    
    h3 {
      color: #333333;
    padding-top:1rem;
      }
    
    p {
      color: #666666;
    margin:1rem 0;
    }
    
    .token {
      padding-top:1rem;
      background-color: #ffd74a;
      padding: 10px;
      font-size: 18px;
      border-radius: 6px;
      margin: 2rem 0;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="logo">Shiksha</h1>
    <h3>Email Verification</h3>
    <p>
      Thank you for signing up! Please use the following token to verify your email address:
    </p>
    <div class="token">${token}</div>
    <p>If you did not sign up for our service, please ignore this email.</p>
  </div>
</body>
</html>
  `;
};
const generateForgotPasswordEmail = (link) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forgot Password</title>
    <style>
      body,
      h1,
      h3,
      p,
      div {
        margin: 0;
        padding: 0;
      }

      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        background-color: #f4f4f4;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        background-color: #ffffff;
      }
      .logo {
        text-align: center;
        color: #000000;
        margin: 1rem 0;
      }
      span {
        color: #ffd74a;
        font-size: 2.2rem;
      }

      h3 {
        color: #333333;
        margin: 1rem 0;
      }
      p {
        color: #666666;
        margin: 1rem 0;
      }
      .email {
        margin-bottom: 20px;
      }
      .token {
        background-color: #ffd74a;
        padding: 10px;
        font-size: 18px;
        border-radius: 6px;
        margin: 1rem 0;
        margin-bottom: 20px;
        font-weight: 700;
      }
      .reset-link {
        padding-top: 1rem;
        padding: 10px;
        font-size: 18px;
        border-radius: 6px;
        margin: 1rem 0;
        font-weight: 700;
        text-align: center;
        background-color: #ffd74a;
      }
      a {
        color: #ffd74a;
      }
      h4 {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="logo">Shiksha</h1>
      <h3>Forgot Password</h3>
      <p>Please enter your email address to reset your password:</p>
      <p>Your reset token is:</p>
      <h4>Click</h4>
      <div class="reset-link">
        <a href="${link}" style="text-decoration: none; color: #000000"
          >Reset Password</a
        >
      </div>
      <h4>or Copy</h4>
      <div class="token">
        <a href="${link}" style="text-decoration: none; color: #000000">
          ${link}
        </a>
      </div>
    </div>
  </body>
</html>
`;
};
const sendAddStaffTokenEmail = ({ token, senderEmail }) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Business Token of Shiksha</title>
    <style>
      body,
      h1,
      h3,
      p,
      div {
        margin: 0;
        padding: 0;
      }

      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        background-color: #f4f4f4;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        background-color: #ffff;
      }
      .logo {
        text-align: center;
        color: #000000;
        margin: 1rem 0;
      }
      span {
        color: #ffd74a;
        font-size: 2.2rem;
      }

      h3 {
        color: #333333;
        margin: 1rem 0;
      }
      p {
        color: #666666;
        margin: 1rem 0;
      }
      .email {
        margin-bottom: 20px;
      }
      .token {
        background-color: #ffd74a;
        padding: 10px;
        font-size: 18px;
        border-radius: 6px;
        margin: 1rem 0;
        margin-bottom: 20px;
        font-weight: 700;
      }
      .reset-link {
        padding-top: 1rem;
        padding: 10px;
        font-size: 18px;
        border-radius: 6px;
        margin: 1rem 0;
        font-weight: 700;
        background-color: #ffc800;
      }
      p,.black-color {
        color: #000;
      }
      a,
      .star {
        text-align: left;
        color: #ffd74a;
      }
      h4 {
        text-align: center;
      }
        .underline{
        font-size: 1.25rem;
        text-decoration: underline;
        }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 class="logo">Shiksha</h1>
      <h3>Business Token for Staff</h3>
      <p class="star">
        Paste the token into the 'Business Name' field while creating your
        account
      </p>
      <div class="reset-link">
        <p class="black-color">
          ${token}
        </p>
      </div>
      <div class="email">
        <p class="star">Sent by: <strong>${senderEmail}</strong></p> 
      </div>
       <a class="underline" href="${frontEndLink}">Click to Create Account on Shiksha</a>
    </div>
  </body>
</html>
`;
};

module.exports = {
  generateEmailVerification,
  generateForgotPasswordEmail,
  sendAddStaffTokenEmail,
};
