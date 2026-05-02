import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>News Aggregator</title>
        <meta name="description" content="Automated News Aggregation Web Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          News Aggregator
        </h1>
        <p className="text-center text-gray-600">
          Automated news collection and aggregation system
        </p>
      </main>
    </>
  )
}
