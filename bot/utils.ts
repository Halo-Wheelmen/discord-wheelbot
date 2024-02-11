import 'dotenv/config'
import { inspect } from 'util'

import type { APIGuildInteraction, APIInteractionResponse } from 'discord-api-types/v10'
import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10'
import { verifyKey } from 'discord-interactions'

import { STRINGS } from './strings'

export const pp = (v: unknown) => inspect(v, false, null)

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

export class Discord {
  /**
   * Verifies the request signature of a Discord interaction
   * @param clientKey The Public Key of the application assigned by Discord
   * @param headers The headers of the request
   * @param body The unparsed body of the request
   */
  static verifyIncomingRequest(
    clientKey: string,
    headers: Record<string, string>,
    body: string,
  ) {
    const signature = headers['x-signature-ed25519']
    const timestamp = headers['x-signature-timestamp']

    if (!signature || !timestamp) {
      throw new Error('Bad request signature')
    }

    const isValidRequest = verifyKey(body, signature, timestamp, clientKey)
    if (!isValidRequest) {
      console.error({ body, signature, timestamp, clientKey })
      throw new Error('Bad request signature')
    }
  }

  /**
   * Executes a request to the Discord API
   * @param endpoint The endpoint to request (omit the root URL, it is automatically prepended)
   * @param options Any options to pass to the fetch function. Some headers are set automatically
   * and cannot be overwritten: Authorization, Content-Type, and User-Agent.
   */
  static async sendAPIRequest<
    /** The endpoint response signature */
    ResponseType = unknown
  >(
    endpoint: string,
    options: RequestInit = {},
  ): DiscordRequestResponse<ResponseType> {
    // append endpoint to root API URL
    const url = new URL(`https://discord.com/api/v10/${endpoint}`)

    try {
      // Use node-fetch to make requests
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers ?? [],
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'User-Agent': 'WheelBot (https://github.com/Stryker-can-has/discord-wheelbot, 1.0.0)',
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
  static ephemeralResponse(content: string): APIInteractionResponse {
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
  static unknownErrorResponse =
    (interactionId: string) => this.ephemeralResponse(STRINGS.unknownError + interactionId)

  /**
   * An ephemeral response for unknown commands.
   */
  static unknownCommandResponse =
    (interactionId: string) => this.ephemeralResponse(STRINGS.unknownCommand + interactionId)

  /**
   * Type guard to check if an object is valid as an APIGuildInteraction
   * @param interaction The object to check
   */
  static isAPIGuildInteraction(interaction: unknown): interaction is APIGuildInteraction {
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
  static assertAPIGuildInteraction(data: unknown): asserts data is APIGuildInteraction {
    if (!this.isAPIGuildInteraction(data)) {
      throw new Error('Expected APIGuildInteraction')
    }
  }
}
