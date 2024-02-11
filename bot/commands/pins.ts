import type { Snowflake } from 'discord-api-types/globals'
import { ApplicationCommandType } from 'discord-api-types/v10'
import type {
  RESTGetAPIChannelPinsResult,
  RESTPutAPIChannelPinResult,
} from 'discord-api-types/v10'

import { CommandHelpers } from './helpers'
import type { IContextMenuCommandDefinition } from '../@types/commands'
import { Discord } from '../utils'

/***********************
 * COMMAND DEFINITIONS *
 ***********************/

/**
 * Creates a new pin in a channel. If the message is already pinned, it will not be pinned again.
 */
export const PIN_COMMAND: IContextMenuCommandDefinition = {
  command: {
    name: 'Pin this message',
    type: ApplicationCommandType.Message,
  },
  handler: async function pinMessageCommandHandler(interaction) {
    if (interaction.data.type !== this.command.type) {
      return Discord.unknownErrorResponse(interaction.id)
    }

    const { channelId, messageId } = CommandHelpers.getChannelAndMessageId(interaction)
    const matchingPin = await getMatchingPin(channelId, messageId, interaction.id)
    if (matchingPin) {
      return Discord.ephemeralResponse('This message was already pinned. No action taken.')
    }

    const [err, res] = await Discord.sendAPIRequest<RESTPutAPIChannelPinResult>(
      `channels/${channelId}/pins/${messageId}`,
      {
        method: 'PUT',
        headers: {
          ...CommandHelpers.auditLogHeader(interaction),
        },
      },
    )

    if (err || res.status !== 204) {
      return Discord.unknownErrorResponse(interaction.id)
    }

    return Discord.ephemeralResponse('Pinned added successfully')
  },
}

/**
 * Removes a pin from a channel. If the message is not pinned, no action will be taken.
 */
export const UNPIN_COMMAND: IContextMenuCommandDefinition = {
  command: {
    name: 'Remove this pin',
    type: ApplicationCommandType.Message,
  },
  handler: async function unpinMessageCommandHandler(interaction) {
    const { channelId, messageId } = CommandHelpers.getChannelAndMessageId(interaction)
    const matchingPin = await getMatchingPin(channelId, messageId, interaction.id)
    if (!matchingPin) {
      return Discord.ephemeralResponse('This message was not in the pins. No action taken.')
    }
    const [err, res] = await Discord.sendAPIRequest(
      `channels/${channelId}/pins/${messageId}`,
      {
        method: 'DELETE',
        headers: {
          ...CommandHelpers.auditLogHeader(interaction),
        },
      },
    )

    if (err || res.status !== 204) {
      return Discord.unknownErrorResponse(interaction.id)
    }

    return Discord.ephemeralResponse('Pin removed successfully')
  },
}

/***********************
 * HELPER FUNCTIONS    *
 ***********************/

/**
 * Looks for a message in the pins of a channel
 * @param channelId The channel ID to search
 * @param messageId The message ID to search for
 * @returns A pin ID if found, otherwise undefined
 */
async function getMatchingPin(
  channelId: Snowflake,
  messageId: Snowflake,
  interactionId: Snowflake,
) {
  const [err, res] = await Discord.sendAPIRequest<RESTGetAPIChannelPinsResult>(
    `channels/${channelId}/pins`,
    { method: 'GET' },
  )

  if (err || !Array.isArray(res.data)) {
    return Discord.unknownErrorResponse(interactionId)
  }

  return res.data.find((pin) => pin.id === messageId)
}
