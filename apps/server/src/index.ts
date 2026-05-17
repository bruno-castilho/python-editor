import { app } from './app'

const port = Number(process.env.PORT ?? 3000)

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Server running on port ${port}`)
})
