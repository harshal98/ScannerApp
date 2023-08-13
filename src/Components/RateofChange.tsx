import { ROC } from "@debut/indicators"
import { useEffect, useState } from "react"
import { getData } from "./GetData";
import axios, { AxiosResponse } from "axios";
import FuturePairs from "./FuturePairs";
import "./Volume.css"
type ROCtype={
  pair : string;
  currRoc : number;
  hour24 ?: number
}

export default function RateofChange() {

  
  const [RocDatalist, setRocDatalist] = useState<ROCtype[]>([])
  
  useEffect(()=>{
    
    let temp :ROCtype[]=[]
    getData(4).then((response :any)=>{
      
      
      console.log(response.length)
      
      response.map((item : {pair:string , data : number[]}) =>{ 
        const roc = new ROC(9);
        
        
        let pair =item.pair
        let rocarray = item.data.map((item:number)=>roc.nextValue(item));

        temp.push({pair:pair,currRoc : rocarray[rocarray.length-1]})})  
        
        axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${FuturePairs.sort().map(item=>`"${item}"`)}]`).then((resonse  : AxiosResponse) =>{
        
      temp = temp.map((item)=>{ 
            let pair24 =  resonse.data.filter((item24tick : any)=>{ 
            if (item24tick.symbol == item.pair) {
              console.log(item24tick.priceChangePercent,item24tick.symbol);
              return item24tick.priceChangePercent}
            })
            return {...item, hour24 :Number( pair24[0].priceChangePercent ) }}) 
            console.log(temp,"final"); 
            setRocDatalist(temp.sort((i :any,j :any )=>{if(i.hour24 < j.hour24) return 1
            else return -1}));  
      })
     
      })

   
    
      
      
    },[]);
  
  return (
    <><div>RateofChange</div>
    <div>{RocDatalist.map(item=>{ if(item.currRoc > 0) return <div> {`${item.pair} ==> ${item.currRoc} ===> ${item.hour24?.toFixed(2)}`}</div>})}</div>
    </>
    
  )
}
