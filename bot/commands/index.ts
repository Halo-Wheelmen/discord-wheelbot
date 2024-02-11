import { ApplicationCommandType } from 'discord-api-types/v10'

import { PIN_COMMAND, UNPIN_COMMAND } from './pins'
import type {
  IChatCommandDefinition,
  IContextMenuCommandDefinition,
  CommandDefinition,
} from '../@types/commands'
import { Discord } from '../utils'

export { CommandHelpers } from './helpers'

class CommandDefinitions extends Array<CommandDefinition> {
  constructor(...definitions: CommandDefinition[]) {
    super(...definitions)
  }

  get RESTInput() {
    return this.map((def) => def.command)
  }

  get(commandName: string): IChatCommandDefinition | IContextMenuCommandDefinition | undefined {
    return this.find((def) => def.command.name === commandName)
  }
}

export const HELP_COMMAND = {
  command: {
    name: 'help',
    description: 'Get info about this bot',
    type: ApplicationCommandType.ChatInput,
  },
  handler: function helpCommandHandler(_: unknown) {
    return Discord.ephemeralResponse(
      "Right-click on a message, and find this bot's commands under Apps.",
    )
  },
} as const

export const APPLICATION_COMMANDS = new CommandDefinitions(
  HELP_COMMAND,
  PIN_COMMAND,
  UNPIN_COMMAND,
)
