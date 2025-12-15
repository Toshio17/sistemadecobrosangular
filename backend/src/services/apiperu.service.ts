import axios from 'axios'

const base = 'https://apiperu.dev/api'

function headers() {
  return { Authorization: `Bearer ${process.env.APIPERU_TOKEN}` }
}

export async function fetchDni(dni: string) {
  const url = `${base}/dni/${dni}`
  try {
    const r = await axios.get(url, { headers: headers() })
    return r.data?.data || null
  } catch {
    return null
  }
}

export async function fetchRuc(ruc: string) {
  const url = `${base}/ruc/${ruc}`
  try {
    const r = await axios.get(url, { headers: headers() })
    return r.data?.data || null
  } catch {
    return null
  }
}
