import axios from "axios";

export default async function webhookToSlack(text: string) {
  const res = await axios.post(
    process.env.SLACK_WEBHOOK_URL,
    { text },
    { headers: { "Content-type": "application/json" } }
  );

  return res;
}
