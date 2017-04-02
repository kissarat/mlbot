import config from '../app/config'
import Job from '../account-manager/job.jsx'
import db from '../store/database.jsx'

function getTask(status) {
  return db.task
    .filter(t => status === t.status)
    .desc('id')
    .first()
}

export default async function run() {
  const now = Date.now()
  const valid = []
  const invalid = []
  for (const job of Job.active) {
    if (job.account.timeout > now - job.started) {
      valid.push(job)
    }
    else {
      job.pause()
      invalid.push(job)
    }
  }
  Job.active = valid
  for(const job of invalid) {
    Job.active.push(job)
    job.start()
  }

  const accepted = await getTask(config.Status.ACCEPTED)
  if (!accepted) {
    const scheduled = await getTask(config.Status.SCHEDULED)
    if (scheduled) {
      console.log(scheduled.toString() + ' accepted')
      db.task.filter(t => scheduled.id === t.id).modify({status: config.Status.ACCEPTED})
      /**
       * @type Job
       */
      const job = new Job[scheduled.type]
      job.task = scheduled
      Job.active.push(job)
      job.start()
    }
  }
}
