import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport"; // <-- ADD THIS LINE
import { secrets } from "../config/config";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
  secrets.CLIENT_ID,
  secrets.CLIENT_SECRET,
  secrets.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: secrets.REFRESH_TOKEN });

async function sendEmailNotification(
  users: Array<any>,
  message: string,
  data: any
) {
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
        clientId: secrets.CLIENT_ID,
        clientSecret: secrets.CLIENT_SECRET,
        refreshToken: secrets.REFRESH_TOKEN,
        accessToken: token,
      },
    });
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const userMail = user.email;
      const notification = await transporter.sendMail({
        from: "Smartpot alert 🌼 <smartpot84@gmail.com>",
        to: userMail,
        subject: `${data.flower.name} notification`,
        text: message,
      });
      console.log("Message sent: %s", notification.messageId);
    }
  } catch (error) {
    console.error(error);
  }
}

import axios from "axios";

async function sendDiscordNotification(message: string, data: any) {
  try {
    await axios.post(secrets.DISCORD_WEBHOOK_URL!, {
      embeds: [
        {
          title: `${data.flower.name} Notification`,
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
