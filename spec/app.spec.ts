import Sinon from 'sinon'
import sinonChai from 'sinon-chai'

import * as app from '../bot/app'
import { CommandHelpers } from '../bot/commands'
import { Discord } from '../bot/utils'

chai.use(sinonChai)

describe('App', () => {
  let installStub: Sinon.SinonStub
  let verifyStub: Sinon.SinonStub
  let routeStub: Sinon.SinonStub
  let eventValidatorStub: Sinon.SinonStub

  beforeEach(() => {
    installStub = Sinon.stub(CommandHelpers, 'installGlobalCommands').resolves()
    verifyStub = Sinon.stub(Discord, 'verifyIncomingRequest')
    routeStub = Sinon.stub(app.CommandRouter, 'routeRequest').resolves()
    eventValidatorStub = Sinon.stub(Discord, 'assertAPIGuildInteraction').returns()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('handler', () => {
    context('when the request has the header modify-global-commands', () => {
      it('installs the global commands', async () => {
        const event = {
          headers: { 'modify-global-commands': 'true' },
          body: '{}',
        }

        const res = await app.handler(event)
        expect(res).to.deep.equal({ type: 999, body: 'Commands modified successfully' })
        expect(installStub).to.have.been.calledOnce
        expect(verifyStub).to.not.have.been.called
        expect(routeStub).to.not.have.been.called
      })
    })

    context('when the request does not have the header modify-global-commands', () => {
      beforeEach(() => {
        verifyStub.returns(undefined)
      })

      it('verifies the request', async () => {
        const event = {
          headers: {},
          body: '{}',
        }

        await app.handler(event)
        expect(installStub).to.not.have.been.called
        expect(verifyStub).to.have.been.calledOnce
      })

      it('routes the request', async () => {
        const event = {
          headers: {},
          body: '{}',
        }

        await app.handler(event)
        expect(installStub).to.not.have.been.called
        expect(routeStub).to.have.been.calledOnce
      })

      it('returns an unknown error response if the request is not valid', async () => {
        eventValidatorStub.throws(new Error('error'))
        const event = {
          headers: {},
          body: '{}',
        }

        const response = await app.handler(event)
        expect(routeStub).to.not.have.been.called
        expect(response).to.deep.equal(Discord.unknownErrorResponse('unknown'))
      })
    })
  })
})
