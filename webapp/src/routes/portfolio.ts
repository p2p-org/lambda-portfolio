import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../logger/logger';
import { getPortfolio } from '../services/portfolio';

const initPortfolioRoutes = (app: FastifyInstance) => {
  app.get(
    '/api/v1/addresses/:address/portfolio',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            address: { type: 'string' },
          },
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { address } = req.params as any;
      logger.info(`Portfolio requested. Address: ${address}`);
      const result = await getPortfolio(address);
      return reply.send(result);
    },
  );

  app.get(
    '/test',
    async (_req: FastifyRequest, reply: FastifyReply) => {
      return reply.send('OK');
    },
  );
};

export { initPortfolioRoutes };
