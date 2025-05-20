interface ScheduleJobRequest {
  jobName: string;
  config: JobConfig;
}

interface JobConfig {
  intervalMs: number;
}
