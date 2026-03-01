import AdminDashboard from '@/components/adminDashboard'

async function getData(){
  const res = await fetch("http://localhost:1337/api/orders?populate=items",
   { cache:"no-store", }
  );
  if(!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default async function adminPage(){
    const data = await getData()
    return <AdminDashboard data={data}/>
}

