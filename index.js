const express = require('express');
const axios = require('axios');
const app = express();

const VERIFY_TOKEN = 'mytoken123';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.use(express.json());

// Send a text message
async function sendText(recipientId, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    { recipient: { id: recipientId }, message: { text } }
  );
}

// Send quick reply buttons
async function sendMenu(recipientId) {
  await axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: {
        text: "Welcome! How can I help you today?",
        quick_replies: [
          { content_type: "text", title: "📦 Our Services", payload: "SERVICES" },
          { content_type: "text", title: "💰 Pricing", payload: "PRICING" },
          { content_type: "text", title: "📞 Contact Us", payload: "CONTACT" }
        ]
      }
    }
  );
}

// Handle each option
async function handlePayload(recipientId, payload) {
  if (payload === 'SERVICES') {
    await sendText(recipientId, "We offer the following services:\n\n1. Web Development\n2. Mobile Apps\n3. AI Chatbots");
    await sendMenu(recipientId); // show menu again after response

  } else if (payload === 'PRICING') {
    await sendText(recipientId, "Our pricing:\n\n💻 Web Dev: Starting $500\n📱 Mobile App: Starting $1000\n🤖 Chatbot: Starting $300");
    await sendMenu(recipientId);

  } else if (payload === 'CONTACT') {
    await sendText(recipientId, "You can reach us at:\n\n📧 Email: hello@yourcompany.com\n📞 Phone: +880 1234 567890");
    await sendMenu(recipientId);
  }
}

app.post('/webhook', async (req, res) => {
  const messaging = req.body.entry[0].messaging[0];
  const senderId = messaging.sender.id;

  // User clicked a quick reply button
  if (messaging.message?.quick_reply) {
    const payload = messaging.message.quick_reply.payload;
    await handlePayload(senderId, payload);

  // User typed a message
  } else if (messaging.message?.text) {
    const text = messaging.message.text.toLowerCase();

    if (text.includes('hi') || text.includes('hello') || text.includes('start')) {
      await sendMenu(senderId);
    } else {
      await sendText(senderId, "I didn't understand that. Let me show you what I can help with!");
      await sendMenu(senderId);
    }
  }

  res.sendStatus(200);
});

app.listen(3000);
