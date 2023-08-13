import axios from "axios";

import { useEffect, useMemo, useState } from 'react'

export default function TestComponent() {
    const memoobj = useMemo(async ()=> await getData(),[]);
    let data:any= []
    const [res,setres]=useState<any[]>()    

    async function getData() {
      console.log("inside getdata function");
      
      const response =  await axios.get("https://api.binance.com/api/v3/klines?interval=1d&limit=13&symbol=LTCUSDT")
      setres(response.data)    }

    useEffect(()=>{
       setres(data);
    },[])

    
  return (
    <div>
    <div>memo</div>
    <button onClick={()=>console.log(memoobj)}>Click</button>
    <div>{res?.map((item)=>{return <div>{item.symbol}</div>})}</div>
    </div>
  )
}
