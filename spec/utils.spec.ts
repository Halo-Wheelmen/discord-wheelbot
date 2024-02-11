import * as discordInteractions from 'discord-interactions'
import Sinon from 'sinon'

import { Discord, pp } from '../bot/utils'

describe('Discord', () => {
  describe('verifyIncomingRequest', () => {
    it('should throw an error if the x-signature-ed25519 header is missing', () => {
      const headers = {
        'x-signature-timestamp': 'timestamp',
      }

      expect(() => { Discord.verifyIncomingRequest('key', headers, 'body') })
        .to.throw('Bad request signature')
    })

    it('should throw an error if the x-signature-timestamp header is missing', () => {
      const headers = {
        'x-signature-ed25519': 'signature',
      }

      expect(() => { Discord.verifyIncomingRequest('key', headers, 'body') })
        .to.throw('Bad request signature')
    })

    it('should throw an error if the request signature is invalid', () => {
      const verifyKeyStub = Sinon.stub(discordInteractions, 'verifyKey').returns(false)
      const consoleErrorStub = Sinon.stub(console, 'error')
      const headers = {
        'x-signature-ed25519': 'signature',
        'x-signature-timestamp': 'timestamp',
      }

      expect(() => { Discord.verifyIncomingRequest('key', headers, 'body') })
        .to.throw('Bad request signature')
      verifyKeyStub.restore()
      consoleErrorStub.restore()
    })
  })

  describe('sendAPIRequest', () => {
    let fetchStub: Sinon.SinonStub
    const defaultHeaders = {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'WheelBot (https://github.com/Stryker-can-has/discord-wheelbot, 1.0.0)',
    }

    beforeEach(() => {
      fetchStub = Sinon.stub(global, 'fetch').resolves(
        new Response(
          JSON.stringify({ body: 'content' }),
          {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' }),
          },
        ),
      )
    })

    afterEach(() => {
      fetchStub.restore()
    })

    it('should make a fetch request to the Discord API', async () => {
      await Discord.sendAPIRequest('endpoint', { method: 'GET' })
      expect(fetchStub).to.have.been.calledWith(
        new URL('https://discord.com/api/v10/endpoint'),
        {
          method: 'GET',
          headers: defaultHeaders,
        },
      )
    })

    it('should overwrite Authorization, Content-Type, and User-Agent headers', async () => {
      await Discord.sendAPIRequest('endpoint', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/vnd.api+json',
          'User-Agent': 'Some other thing',
        },
      })
      expect(fetchStub).to.have.been.calledWith(
        new URL('https://discord.com/api/v10/endpoint'),
        {
          method: 'GET',
          headers: defaultHeaders,
        },
      )
    })

    it('should return an error if the response status is not ok', async () => {
      fetchStub.resolves(new Response(JSON.stringify({ body: 'content' }), { status: 400 }))
      const [err, res] = await Discord.sendAPIRequest('endpoint', { method: 'GET' })
      expect(err, pp(res)).to.be.instanceOf(Error)
      expect(res).to.be.undefined
    })

    it('should return the response data and status if the request was successful', async () => {
      const [err, res] = await Discord.sendAPIRequest('endpoint', { method: 'GET' })
      expect(err).to.be.undefined
      expect(res).to.deep.equal({ data: { body: 'content' }, status: 200 })
    })

    it('should return an error if the response could not be parsed as JSON', async () => {
      fetchStub.resolves(new Response('not json', { status: 200 }))
      const [err, res] = await Discord.sendAPIRequest('endpoint', { method: 'GET' })
      expect(err, pp(res)).to.be.instanceOf(Error)
      expect(res).to.be.undefined
    })

    it('should return an error if `fetch` throws', async () => {
      fetchStub.rejects(new Error('fetch error'))
      const [err, res] = await Discord.sendAPIRequest('endpoint', { method: 'GET' })
      expect(err, pp(res)).to.be.instanceOf(Error)
      expect(res).to.be.undefined
    })
  })

  describe('isAPIGuildInteraction', () => {
    context('when the interaction is an APIGuildInteraction', () => {
      it('should return true', () => {
        const interaction = { id: 'id', type: 1, data: {}, guild_id: 'guild_id', channel_id: 'channel_id', member: {} }
        expect(Discord.isAPIGuildInteraction(interaction)).to.be.true
      })
    })

    context('when the interaction is missing required properties', () => {
      const requiredKeys = ['id', 'type', 'data', 'guild_id', 'channel_id', 'member'] as const
      for (const key of requiredKeys) {
        it(`should return false if the interaction is missing the ${key} property`, () => {
          const interaction = { id: 'id', type: 1, data: {}, guild_id: 'guild_id', channel_id: 'channel_id', member: {} }
          delete interaction[key]
          expect(Discord.isAPIGuildInteraction(interaction)).to.be.false
        })
      }
    })

    it('should return false if the interaction is not an object or is null', () => {
      expect(Discord.isAPIGuildInteraction(null)).to.be.false
      expect(Discord.isAPIGuildInteraction('string')).to.be.false
    })
  })

  describe('assertAPIGuildInteraction', () => {
    it('should not throw the interaction if it is an APIGuildInteraction', () => {
      const interaction = { id: 'id', type: 1, data: {}, guild_id: 'guild_id', channel_id: 'channel_id', member: {} }
      expect(() => { Discord.assertAPIGuildInteraction(interaction) }).to.not.throw()
    })

    it('should throw an error if the interaction is not an APIGuildInteraction', () => {
      expect(() => { Discord.assertAPIGuildInteraction({}) }).to.throw('Expected APIGuildInteraction')
    })
  })
})
