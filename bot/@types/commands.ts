import type {
  APIInteractionResponse,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  APIApplicationCommandGuildInteraction,
} from 'discord-api-types/v10'

interface IBaseCommandDefinition {
  handler: (
    interaction: APIApplicationCommandGuildInteraction
  ) => Promise<APIInteractionResponse> | APIInteractionResponse
}

export interface IChatCommandDefinition extends IBaseCommandDefinition {
  command: RESTPostAPIChatInputApplicationCommandsJSONBody
}

export interface IContextMenuCommandDefinition extends IBaseCommandDefinition {
  command: RESTPostAPIContextMenuApplicationCommandsJSONBody
}

export type CommandDefinition = IChatCommandDefinition | IContextMenuCommandDefinition
