import { KnownBlock, Block } from "@slack/types";
import {
  ViewsOpenArguments,
  ViewsUpdateArguments,
} from "@slack/web-api/dist/methods";

export function createViewOpen(
  token: string,
  private_metadata: string,
  blocks: (KnownBlock | Block)[],
  trigger_id: string
): ViewsOpenArguments {
  return {
    token,
    trigger_id,
    view: {
      type: "modal",
      callback_id: "view_1",
      private_metadata,
      title: {
        type: "plain_text",
        text: "homis ChatOps",
      },
      blocks,
      submit: {
        type: "plain_text",
        text: "Submit",
      },
    },
  };
}

export function createViewUpdate(
  token: string,
  private_metadata: string,
  blocks: (KnownBlock | Block)[],
  view_id: string
): ViewsUpdateArguments {
  return {
    token,
    view_id,
    view: {
      type: "modal",
      callback_id: "view_1",
      private_metadata,
      title: {
        type: "plain_text",
        text: "homis ChatOps",
      },
      blocks,
      submit: {
        type: "plain_text",
        text: "Submit",
      },
    },
  };
}
