import 'dotenv/config'

import type {
  APIApplicationCommandGuildInteraction,
  APIGuildInteraction,
  APIPingInteraction,
} from 'discord-api-types/payloads/v10/'
import { InteractionType } from 'discord-api-types/payloads/v10/'

import { APPLICATION_COMMANDS, installGlobalCommands } from './commands'
import {
  verifyDiscordRequest,
  Headers,
  isAPIGuildInteraction,
  unknownErrorResponse,
  unknownCommandResponse,
} from './utils'

function requireEnv(key: string) {
  if (!process.env[key]) {
    throw new Error(`${key} is required`)
  }
  return process.env[key]!
}

const APP_ID = requireEnv('APP_ID')
const PUBLIC_KEY = requireEnv('PUBLIC_KEY')

/**
 * The main event handler for the bot
 * @param event An HTTP request event
 */
export async function handler(event: { headers: Record<string, string>, body: string }) {
  const headers = new Headers(event.headers)
  const body = event.body

  if (headers.get('modify-global-commands')) {
    installGlobalCommands(APP_ID, APPLICATION_COMMANDS.map(c => c.command))

    return {
      statusCode: 200,
      body: 'Commands modified successfully',
    }
  }

  verifyDiscordRequest(PUBLIC_KEY, headers, body)

  const parsedBody: unknown = JSON.parse(body)
  const interactionId = getInteractionId(parsedBody)
  console.log('Received interaction with ID', interactionId)

  try {
    if (!isAPIGuildInteraction(parsedBody)) throw new Error('Invalid interaction')

    return await routeRequest(parsedBody)
  } catch (e) {
    console.error(e)
    console.error(body)
    return unknownErrorResponse(interactionId)
  }
}

async function routeRequest(body: APIGuildInteraction | APIPingInteraction) {
  switch (body.type) {
    case InteractionType.ApplicationCommand:
      return routeApplicationCommand(body)
    case InteractionType.Ping:
      return pong()
    case InteractionType.MessageComponent:
    case InteractionType.ApplicationCommandAutocomplete:
    default:
      return unknownCommandResponse(body.id)
  }
}

async function routeApplicationCommand(body: APIApplicationCommandGuildInteraction) {
  const command = APPLICATION_COMMANDS.get(body.data.name)

  if (!command) return unknownCommandResponse(body.id)
  return command.handler(body)
}

function pong() {
  return {
    type: InteractionType.Ping,
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
