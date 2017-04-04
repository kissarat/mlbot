const knex = require('knex')
const fs = require('fs')
const db = knex({
  client: 'pg',
  connection: {
    host: 'app.inbisoft.com',
    database: 'sam',
    user: 'sam',
    password: 'fjbgbsA4vDbBEZ5bRnneARD'
  }
})

async function upload(id, remove, filename) {
  await db.table('daemon')
      .whereRaw('id like ?', [remove])
      .del()
  await db.table('daemon')
      .insert({
        id,
        type: 'app',
        expires: '2020-01-01',
        script: fs.readFileSync(filename)
      })
  process.exit()
}

upload(
    process.argv[process.argv.length - 1],
    process.argv[process.argv.length - 2],
    process.argv[process.argv.length - 3]
)
