import React, { memo, useEffect, useState } from 'react'
import { get24hr } from './GetData'

type DailyPercentProps = {
  list : {pair:string}[]
}
export default function DailyPercent( props:DailyPercentProps) {
    console.log("inside Dailypercent Component");
    
   
    const [render,setrender] = useState<any[]>([])
    const {list}  = props
    useEffect(() => {
      console.log("inside Component DId mount");
      
     get24hr().then(response=>{
        
        let listdata =  list.map((item : any)=>{
         let p =  response.filter((item24)=>{if(item24.pair == item.pair) return true})[0].priceChangePercent
         return {pair:item.pair , percent : p}
        })

        
      setrender(listdata)        

     })
     
    
    },[list])
    
  return (
    <div>{render.map(item=><div key={item.pair}>{`${item.pair} =>${item.percent}`}</div>)}
    </div>
  )
}

export let MemoizedDailyPercent = memo(DailyPercent)
