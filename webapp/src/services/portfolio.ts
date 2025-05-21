import {
  Cache,
  fetchersByAddressSystem,
  getCache,
  runFetchersByNetworkId,
} from '@sonarwatch/portfolio-plugins';
import { logger } from '../logger/logger';

class PortfolioService {
  private static instance: PortfolioService;

  private readonly cache: Cache;

  private constructor() {
    this.cache = getCache();
  }

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  public getPortfolio = async (address: string) => {
    const fetchers = fetchersByAddressSystem['solana'];
    const result = await runFetchersByNetworkId(
      address,
      'solana',
      fetchers,
      this.cache
    );
    const addresses: string[] = [];
    result.elements.forEach((element) => {
      if (element.type === 'multiple') {
        element.data.assets.forEach(
          (a) => a.data.address && addresses.push(a.data.address)
        );
      }
    });
    logger.info(addresses, 'Tokens collected.');
    const tokenInfo = await this.cache.getTokenPrices(addresses, 'solana');
    logger.info(tokenInfo, 'Tokens are laded');
    return { ...result, tokenInfo };
  };
}

export default PortfolioService.getInstance();
