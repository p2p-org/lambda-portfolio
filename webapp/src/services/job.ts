import { Cache, getCache, jobs } from '@sonarwatch/portfolio-plugins';
import { logger } from '../logger/logger';

class JobRunner {
  private static instance: JobRunner;

  private readonly jobsLimit: number;
  private readonly cache: Cache;

  private jobsQueue: Array<() => void>;
  private scheduledTasks: Array<NodeJS.Timeout>;
  private runningJobsCount: number;

  private constructor() {
    this.jobsLimit = 5;
    this.runningJobsCount = 0;
    this.jobsQueue = [];
    this.scheduledTasks = [];
    this.cache = getCache();
  }

  public static getInstance(): JobRunner {
    if (!JobRunner.instance) {
      JobRunner.instance = new JobRunner();
    }
    return JobRunner.instance;
  }

  public schedule({ jobName, config }: ScheduleJobRequest) {
    const runTask = async () => {
      this.runningJobsCount++;
      try {
        const job = jobs.find((job) => job.id === jobName);
        if (!job) {
          logger.warn(`Job not found. Name=${jobName}`);
          return;
        }
        const startDate = Date.now();
        logger.info(`Job found. Id=${jobName}`);
        await job.executor(this.cache);
        const duration = ((Date.now() - startDate) / 1000).toFixed(2);
        logger.info(`Job finished. Id=${jobName} Duration=(${duration}s)`);
      } catch (err) {
        console.error('Task failed:', err);
      } finally {
        this.runningJobsCount--;
        this.tryNext();
      }
    };

    const runWithThrottle = () => {
      if (this.runningJobsCount < this.jobsLimit) {
        runTask();
      } else {
        this.jobsQueue.push(runWithThrottle);
      }
    };

    runWithThrottle();

    const timer = setInterval(() => {
      runWithThrottle();
    }, config.intervalMs);
    this.scheduledTasks.push(timer);
  }

  private tryNext() {
    while (
      this.runningJobsCount < this.jobsLimit &&
      this.jobsQueue.length > 0
    ) {
      const next = this.jobsQueue.shift();
      next?.();
    }
  }

  public stopAll() {
    for (const timer of this.scheduledTasks) {
      clearInterval(timer);
    }
    this.scheduledTasks = [];
    this.jobsQueue = [];
  }
}

export default JobRunner.getInstance();
