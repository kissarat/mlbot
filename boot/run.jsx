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
  for (const job of invalid) {
    Job.active.push(job)
    job.start()
  }

  let task = await getTask(config.Status.ACCEPTED)
  if (task) {
    if (Job.active.find(j => task.id === j.task.id)) {
      task = null
    }
  } else {
    task = await getTask(config.Status.SCHEDULED)
  }
  if (task) {
    console.log(task.toString() + ' accepted')
    if (config.Status.ACCEPTED !== task.status) {
      task.status = config.Status.ACCEPTED
      await db.task.filter(t => task.id === t.id).modify({status: task.status})
      Task.emit('update', task)
    }
    /**
     * @type Job
     */
    const job = new Job[task.type]
    job.task = task
    Job.active.push(job)
    job.start()
  }
}
