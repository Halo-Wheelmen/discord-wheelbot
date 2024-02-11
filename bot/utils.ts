import 'dotenv/config'
import { inspect } from 'util'

import type { APIGuildInteraction, APIInteractionResponse } from 'discord-api-types/v10'
import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10'
import { verifyKey } from 'discord-interactions'

import { STRINGS } from './strings'

export const pp = (v: unknown) => { console.log(inspect(v, false, null)) }

/**
 * Verifies the request signature of a Discord interaction
 * @param clientKey The Public Key of the application assigned by Discord
 * @param headers The headers of the request
 * @param body The unparsed body of the request
 */
export function verifyDiscordRequest(clientKey: string, headers: Headers, body: string) {
  const signature = headers.get('x-signature-ed25519')
  const timestamp = headers.get('x-signature-timestamp')

  const isValidRequest = verifyKey(body, signature, timestamp, clientKey)
  if (!isValidRequest) {
    console.error(body, signature, timestamp, clientKey)
    throw new Error('Bad request signature')
  }
}

/**
 * A tuple representing the result of a Discord API request.
 * The first element is an error if one occurred, otherwise undefined.
 * The second element is the response data and status if the request was successful,
 * otherwise undefined.
 */
type DiscordRequestResponse<T> = Promise<
  [Error, undefined] |
  [undefined, {
    data: T,
    status: number
  }]>

/**
 * Executes a request to the Discord API
 * @param endpoint The endpoint to request (omit the root URL, it is automatically prepended)
 * @param options Any options to pass to the fetch function. Some headers are set automatically
 * and cannot be overwritten: Authorization, Content-Type, and User-Agent.
 */
export async function discordRequest<
  /** The endpoint response signature */
  ResponseType = unknown
>(
  endpoint: string,
  options: RequestInit = {},
): DiscordRequestResponse<ResponseType> {
  // append endpoint to root API URL
  const url = new URL(`https://discord.com/api/v10/${endpoint}`)
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body)
  try {
    // Use node-fetch to make requests
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers ?? [],
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
      },
    })

    // return API errors
    if (!res.ok) {
      console.log(res.status)
      return [
        new Error(JSON.stringify(await res.json())),
        undefined,
      ]
    }

    try {
      // return parsed response data
      return [
        undefined,
        {
          data: await res.json() as ResponseType,
          status: res.status,
        },
      ]
    } catch (_) {
      // return errors in parsing response data
      console.log(res.status)
      console.log(await res.text())
      return [
        new Error('Response was not JSON'),
        undefined,
      ]
    }
  } catch (err) {
    return [
      err instanceof Error ? err : new Error(String(err)),
      undefined,
    ]
  }
}

/**
 * Generates a command response that is only visible to the user who invoked the command,
 * and is not persisted to the channel.
 * @param content The string content of the response
 */
export function ephemeralResponse(content: string): APIInteractionResponse {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content,
      flags: MessageFlags.Ephemeral,
    },
  }
}

/**
 * An ephemeral response for unknown problems.
 */
export const unknownErrorResponse =
  (interactionId: string) => ephemeralResponse(STRINGS.unknownError + interactionId)

/**
 * An ephemeral response for unknown commands.
 */
export const unknownCommandResponse =
  (interactionId: string) => ephemeralResponse(STRINGS.unknownCommand + interactionId)

/**
 * A wrapper around the raw headers of a request that allows for
 * type-safe access to arbitrary header keys.
 */
export class Headers {
  rawHeaders: Record<string, string>

  constructor(headerObject: Record<string, string>) {
    this.rawHeaders = headerObject

    return new Proxy(this, {
      get: (target, prop) => {
        if (target.get(prop)) {
          return target.get(prop)
        } else {
          throw new Error(`Header "${String(prop)}" not present`)
        }
      },
    })
  }

  get(headerName: string | symbol) {
    return this.rawHeaders[String(headerName)]
  }
}

/**
 * Type guard to check if an object is valid as an APIGuildInteraction
 * @param interaction The object to check
 */
export function isAPIGuildInteraction(interaction: unknown): interaction is APIGuildInteraction {
  if (typeof interaction !== 'object' || interaction === null) return false

  const requiredKeysForAPIGuildInteraction = [
    'id',
    'type',
    'data',
    'guild_id',
    'channel_id',
    'member',
  ]
  for (const key of requiredKeysForAPIGuildInteraction) {
    if (!(key in interaction)) return false
  }
  return true
}

/**
 * Parses a string into an APIGuildInteraction object
 * @param data String data that may be a valid APIGuildInteraction
 * @returns a parsed APIGuildInteraction
 * @throws if the data is not a valid APIGuildInteraction
 */
export function parseAPIGuildInteraction(data: unknown) {
  if (!isAPIGuildInteraction(data)) {
    throw new Error('Expected APIGuildInteraction')
  }
  return data
}
