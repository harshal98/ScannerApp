//import React from 'react'
import {MACD}  from '@debut/indicators';
import { useEffect, useState } from 'react';
import axios from "axios"
import FuturePairs from './FuturePairs';
export type ohlc = {
    o : number;
    c : number;
    h : number;
    l : number;
}
function Macd() {
    const macdobj =  new MACD(12,26,9)
    //console.log(macdobj);
    
    const [macdval,Setmacdval] =useState([{}])
   const [datalist,/*setdatalist*/] = useState<ohlc[]>([]);
   const [pair,setpair] = useState("BTCUSDT");
    console.log(datalist.length);
    
    
     
    useEffect(()=>{
        let closearray : ohlc [];
        console.log(pair);
        
        const response = axios.get(`https://api.binance.com/api/v3/klines?interval=1h&limit=1000&symbol=${pair}`)
        response.then((response : any)=>{ 
           closearray = response.data.map((item : any)=> {return { c : item[4]}}); 
           //setdatalist(closearray)
           Setmacdval(closearray.map(x=>macdobj.nextValue(Number(x.c))).reverse().slice(0,96))
        })
   
        
        
},[pair])
    useEffect(()=>{
       // datalist.map((item)=>{console.log(macdobj.nextValue(item.c).macd);
       console.log(macdval);
        },[macdval])


        function getMax(array : any){
            let max = array[0].macd;
            for ( let x of array){if(max<x.macd) max = x.macd}

            return max > array[0].macd
            


        }
    //},[])
  return (
    
    <div /*style={{display:"flex",justifyContent:"center"}}*/>
        <select onChange={(e)=>setpair(e.target.value)} defaultValue={pair}>{FuturePairs.sort().map(pair => <option>{pair}</option>)}</select>
        <h1>{pair}</h1>
        <div>{
            String(getMax(macdval))
        /*macdval. map((item : any)=>{
            let html = <div>"novlue"</div>
            if(item){
                item
            }
            return <div> {item == undefined ? "novlue" : item.macd }</div>})*/}</div>
        </div>
  )
}

export default Macd