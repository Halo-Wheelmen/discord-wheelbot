import type {
  APIApplicationCommandGuildInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsJSONBody,
  Snowflake,
} from 'discord-api-types/v10'

import { Discord } from '../utils'

export class CommandHelpers {
  /**
   * Installs all global commands. This will replace all global commands for the application.
   * @param appId - The application ID
   * @param commands - The commands to install
   */
  static async installGlobalCommands(
    appId: Snowflake,
    commands: RESTPostAPIApplicationCommandsJSONBody[],
  ) {
    if (appId === '') return

    return await Discord.sendAPIRequest<RESTPutAPIApplicationCommandsJSONBody>(
      `applications/${appId}/commands`,
      {
        method: 'PUT',
        body: JSON.stringify(commands),
      },
    )
  }

  /**
   * Extracts the channel and message ID from an Interaction
   * @param interaction - The Interaction to extract from
   */
  static getChannelAndMessageId(
    interaction: APIApplicationCommandGuildInteraction,
  ) {
    const channelId = interaction.channel.id
    if ('target_id' in interaction.data) {
      return { channelId, messageId: interaction.data.target_id }
    }

    throw new Error('Interaction body did not include a target message ID')
  }

  /**
   * Extracts the username of the user who performed an Interaction
   */
  static getUsername(interaction: APIApplicationCommandGuildInteraction) {
    return interaction.member.user.username
  }

  /**
   * Creates the audit log header for an action
   */
  static auditLogHeader(interaction: APIApplicationCommandGuildInteraction) {
    return {
      'X-Audit-Log-Reason': `Action performed on behalf of user ${this.getUsername(interaction)}`,
    }
  }
}
