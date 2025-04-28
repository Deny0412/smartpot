import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport"; // <-- ADD THIS LINE
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendEmailNotification(users: Array<any>, message: string) {
  try {
    const { token } = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport(<SMTPTransport.Options>{
      // <-- CAST HERE
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: "smartpot84@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: token,
      },
    });
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const userMail = user.email;
      const notification = await transporter.sendMail({
        from: "Smartpot alert 🌼 <smartpot84@gmail.com>",
        to: userMail,
        subject: "Smartpot notification",
        text: message,
      });
      console.log("Message sent: %s", notification.messageId);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

import axios from "axios";

async function sendDiscordNotification(message: string) {
  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
      embeds: [
        {
          title: "New Notification!",
          description: message,
          color: 0x00ff00, // green
        },
      ],
    });
    console.log("Message sent to Discord!");
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}

export default {
  sendEmailNotification,
  sendDiscordNotification,
};
