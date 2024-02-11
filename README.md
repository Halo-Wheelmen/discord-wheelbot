# Wheelbot

A Discord app which serves as a proxy for overly broad Discord permissions. Developed specifically to suit the needs of the Halo Wheelmen community.

This is 1000% to cover a lack of granularity in Discord's permissions, and hopefully Discord will add narrowed permissions at some point and remove the need for this to be a thing.

> [!WARNING]
> This is not deployed anywhere, doesn't have an associated app, and generally just doesn't do anything yet. So, y'know, don't expect you can use it.

## Features

- Allow users to pin and unpin messages without granting them full Manage Messages permission (which would allow them to delete other users' messages).

## How does Wheelbot use your data?

This app does not save any data. Discord provides some details about the user that invokes a given command, as well as the message it was invoked on (if applicable). These are only used to execute the command, and are discarded once the command is complete.

## Installing

1. (**PLACEHOLDER** - this bot is invite-only at the moment, but you're welcome to clone it and host your own) Connect the app to your server. This link will give the app permission to create commands and add a bot, and give that bot the Manage Messages permission, which is required for setting/removing pins.
2. Wheelbot will be immediately available in any public channels. You will need to add the Wheelbot role to any private channels.


## Usage
- To find the app's commands, right-click (or press & hold on mobile), then choose the desired action
  - This app adds the commands "Pin this message" and "Remove this pin"
  - If you try to add a pin that already exists, or remove a message that isn't pinned, the app will sigh heavily at you.
  - If you get an "interaction failed" message, wait a few seconds, then try again. This bot runs on AWS Lambda, and sometimes is too slow to respond if a container isn't already running.

