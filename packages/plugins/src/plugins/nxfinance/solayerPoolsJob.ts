import { NetworkId } from '@sonarwatch/portfolio-core';
import { Cache } from '../../Cache';
import { Job, JobExecutor } from '../../Job';
import { lendProgramId, platformId, solayerPoolKey } from './constants';
import { getClientSolana } from '../../utils/clients';
import { solayerPoolStruct } from './structs';
import { ParsedGpa } from '../../utils/solana/beets/ParsedGpa';

const executor: JobExecutor = async (cache: Cache) => {
  const connection = getClientSolana();
  const solayerPoolAccounts = await ParsedGpa.build(
    connection,
    solayerPoolStruct,
    lendProgramId
  )
    .addFilter('accountDiscriminator', [101, 192, 39, 191, 52, 165, 70, 246])
    .run();

  await cache.setItem(solayerPoolKey, solayerPoolAccounts, {
    prefix: platformId,
    networkId: NetworkId.solana,
  });
};

const job: Job = {
  id: `${platformId}-solayer-pools`,
  executor,
  labels: ['normal'],
};
export default job;
