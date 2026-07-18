const { expect } = require('chai');

describe('Orders Route', function () {
  it('returns empty list for non-ObjectId authenticated user ids on /mine', async function () {
    const router = require('../backend/routes/orders');
    const Order = require('../backend/models/Order');

    const mineRouteLayer = router.stack.find(
      (layer) => layer.route && layer.route.path === '/mine' && layer.route.methods.get
    );
    const mineHandler = mineRouteLayer.route.stack[1].handle;

    const req = {
      user: { _id: 'firebase-uid-123' },
      session: { user: { _id: 'firebase-uid-123' } }
    };

    let responseBody;
    let responseStatus;
    const res = {
      json: (body) => {
        responseBody = body;
        return body;
      },
      status: (code) => {
        responseStatus = code;
        return {
          json: (body) => {
            responseBody = body;
            return body;
          }
        };
      }
    };

    const originalFind = Order.find;
    let findCalled = false;
    Order.find = () => {
      findCalled = true;
      return { sort: async () => [] };
    };

    try {
      await mineHandler(req, res);
      expect(responseStatus).to.equal(undefined);
      expect(responseBody).to.deep.equal([]);
      expect(findCalled).to.equal(false);
    } finally {
      Order.find = originalFind;
    }
  });
});
