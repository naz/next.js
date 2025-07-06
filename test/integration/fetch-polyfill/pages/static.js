export default function StaticPage({ data }) {
  return <div>{data.foo}</div>
}

export async function getStaticProps() {
  const allowedPorts = [3000, 4000]; // Define an allow-list of acceptable ports
  const port = allowedPorts.includes(Number(process.env.NEXT_PUBLIC_API_PORT)) 
    ? process.env.NEXT_PUBLIC_API_PORT 
    : allowedPorts[0]; // Default to the first allowed port if validation fails
  const res = await fetch(`http://localhost:${port}/`)
  const json = await res.json()
  return {
    props: {
      data: json,
    },
  }
}
