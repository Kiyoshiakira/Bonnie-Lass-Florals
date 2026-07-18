const { expect } = require('chai');

describe('Orders Route', function () {
  function getMineHandler() {
    const router = require('../backend/routes/orders');
    const mineRouteLayer = router.stack.find(
      (layer) => layer.route && layer.route.path === '/mine' && layer.route.methods.get
    );
    return mineRouteLayer.route.stack[mineRouteLayer.route.stack.length - 1].handle;
  }

  it('returns empty list for non-ObjectId authenticated user ids on /mine', async function () {
    const Order = require('../backend/models/Order');
    const mineHandler = getMineHandler();

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

  it('queries orders for valid ObjectId user ids on /mine', async function () {
    const Order = require('../backend/models/Order');
    const mineHandler = getMineHandler();

    const validId = '507f1f77bcf86cd799439011';
    const req = {
      user: { _id: validId },
      session: { user: { _id: validId } }
    };

    let responseBody;
    const res = {
      json: (body) => {
        responseBody = body;
        return body;
      },
      status: () => ({
        json: () => null
      })
    };

    const expectedOrders = [{ _id: 'order-id-1' }];
    const originalFind = Order.find;
    let findCalled = false;
    Order.find = (query) => {
      findCalled = true;
      expect(String(query.user)).to.equal(validId);
      return { sort: async () => expectedOrders };
    };

    try {
      await mineHandler(req, res);
      expect(findCalled).to.equal(true);
      expect(responseBody).to.deep.equal(expectedOrders);
    } finally {
      Order.find = originalFind;
    }
  });
});
