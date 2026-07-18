const { expect } = require('chai');

describe('Orders Route', function () {
  const ordersRouter = require('../backend/routes/orders');
  const { mineOrdersHandler } = ordersRouter.__testables;

  it('returns empty list for non-ObjectId authenticated user ids on /mine', async function () {
    const Order = require('../backend/models/Order');

    const req = {
      user: { _id: 'firebase-uid-123' },
      session: { user: { _id: 'firebase-uid-123' } }
    };

    let responseBody;
    let statusCalled = false;
    const res = {
      json: (body) => {
        responseBody = body;
        return body;
      },
      status: (_code) => {
        statusCalled = true;
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
      await mineOrdersHandler(req, res);
      expect(statusCalled).to.equal(false);
      expect(responseBody).to.deep.equal([]);
      expect(findCalled).to.equal(false);
    } finally {
      Order.find = originalFind;
    }
  });

  it('queries orders for valid ObjectId user ids on /mine', async function () {
    const Order = require('../backend/models/Order');

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
      await mineOrdersHandler(req, res);
      expect(findCalled).to.equal(true);
      expect(responseBody).to.deep.equal(expectedOrders);
    } finally {
      Order.find = originalFind;
    }
  });
});
