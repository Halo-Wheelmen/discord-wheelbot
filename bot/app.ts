import 'dotenv/config'

import type {
  APIApplicationCommandGuildInteraction,
  APIGuildInteraction,
  APIPingInteraction,
} from 'discord-api-types/payloads/v10/'
import { InteractionType } from 'discord-api-types/payloads/v10/'

import { APPLICATION_COMMANDS, CommandHelpers } from './commands'
import {
  Discord,
} from './utils'

function requireEnv(key: string) {
  if (!process.env[key]) {
    throw new Error(`${key} is required`)
  }
  return process.env[key]!
}

const APP_ID = requireEnv('APP_ID')
const PUBLIC_KEY = requireEnv('PUBLIC_KEY')

export class CommandRouter {
  static async routeRequest(body: APIGuildInteraction | APIPingInteraction) {
    switch (body.type) {
      case InteractionType.ApplicationCommand:
        return this.routeApplicationCommand(body)
      case InteractionType.Ping:
        return this.pong()
      case InteractionType.MessageComponent:
      case InteractionType.ApplicationCommandAutocomplete:
      default:
        return Discord.unknownCommandResponse(body.id)
    }
  }

  static async routeApplicationCommand(body: APIApplicationCommandGuildInteraction) {
    const command = APPLICATION_COMMANDS.get(body.data.name)

    if (!command) return Discord.unknownCommandResponse(body.id)
    return command.handler(body)
  }

  static pong() {
    return {
      type: InteractionType.Ping,
    }
  }
}

/**
 * The main event handler for the bot
 * @param event An HTTP request event
 */
export async function handler(event: { headers: Record<string, string>, body: string }) {
  const { body, headers } = event

  if (headers['modify-global-commands']) {
    await CommandHelpers.installGlobalCommands(APP_ID, APPLICATION_COMMANDS.map(c => c.command))

    return {
      type: 999,
      body: 'Commands modified successfully',
    }
  }

  Discord.verifyIncomingRequest(PUBLIC_KEY, headers, body)

  const parsedBody: unknown = JSON.parse(body)
  const interactionId = getInteractionId(parsedBody)
  console.log('Received interaction with ID', interactionId)

  try {
    Discord.assertAPIGuildInteraction(parsedBody)

    return await CommandRouter.routeRequest(parsedBody)
  } catch (e) {
    console.error(e)
    console.error(body)
    return Discord.unknownErrorResponse(interactionId)
  }
}

function getInteractionId(body: unknown) {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    !(typeof body.id === 'string')
  ) return 'unknown'
  return body.id
}
