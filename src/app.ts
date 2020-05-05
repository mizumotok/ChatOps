import { App } from "@slack/bolt";
import axios from "axios";
import blocksByTask from "./blocksByTask";
import webhookToSlack from "./webhookToSlack";
import supportedTasks from "./supportedTasks";
import { createViewOpen, createViewUpdate } from "./createView";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

app.command("/homis-ops", async ({ ack, payload, context }) => {
  await ack();

  const task = payload.text.replace("　", " ").trim().split(" ")[0];
  const blocks = blocksByTask(task);

  if (!blocks) {
    try {
      await app.client.views.open({
        token: context.botToken,
        trigger_id: payload.trigger_id,
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "homis ChatOps",
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `タスクが見つかりません *${payload.text}*`,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: `サポートされるタスク：${supportedTasks.join(", ")}`,
              },
            },
          ],
        },
      });
      return;
    } catch (error) {
      console.error(error);
      webhookToSlack(`error happend: ${error}`);
      return;
    }
  }

  try {
    const private_metadata = JSON.stringify({ task });
    await app.client.views.open(
      createViewOpen(
        context.botToken,
        private_metadata,
        blocks,
        payload.trigger_id
      )
    );
  } catch (error) {
    console.error(error);
    webhookToSlack(`error happend: ${error}`);
  }
});

app.action(
  { type: "block_actions" },
  async ({ action, context, body, ack }) => {
    await ack();
    const meta = JSON.parse(body.view.private_metadata);
    const blocks = blocksByTask(meta.task);

    if (action.type === "static_select") {
      meta[action.action_id] = action.selected_option.value;
    }
    const private_metadata = JSON.stringify(meta);
    await app.client.views.update(
      createViewUpdate(context.botToken, private_metadata, blocks, body.view.id)
    );
  }
);

app.view("view_1", async ({ ack, body, view }) => {
  await ack();

  const data: { [actionId: string]: unknown } = JSON.parse(
    body.view.private_metadata
  );
  Object.keys(view.state.values).forEach((blockId) =>
    Object.keys(view.state.values[blockId]).forEach((actionId) => {
      data[actionId] = view.state.values[blockId][actionId].value;
    })
  );

  try {
    await axios.post(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/dispatches`,
      {
        event_type: "chat_ops",
        client_payload: data,
      },
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.everest-preview+json",
        },
      }
    );

    await webhookToSlack(
      `<@${body.user.id}> GitHubにタスク(${data.task})を送りました\n` +
        `https://github.com/${process.env.GITHUB_REPO}/actions`
    );
  } catch (error) {
    console.error(error);
    webhookToSlack(`error happend: ${error}`);
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
