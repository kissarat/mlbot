import Job from '../account-manager/job.jsx'

export default async function run() {
  await Job.restart()
  await Job.start()
}
