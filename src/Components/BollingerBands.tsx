import { BollingerBands } from '@debut/indicators'
import { useEffect, useState } from 'react';

import axios from 'axios';
import FuturePairs from './FuturePairs';

type BBscanner = {
  pair : string
  //bblist : number[];
  max : number
  current : number
}

function Bollinger() {
 

  let bb = new BollingerBands()

  //const [bbval,setbbval] = useState<any[]>([])
  const [BBscannerobj , SetBBscannerobj] = useState<BBscanner[]>([])

  async function getData(){

    let closearray : any [];
    let temp : BBscanner[] = []
    let responses : any [] = []; 
    for( let pair of FuturePairs){
      //console.log(pair);
      responses.push(axios.get(`https://api.binance.com/api/v3/klines?interval=1h&limit=100&symbol=${pair}`))
    }

    
      //console.log(pair);
    axios.all(responses).then(responses => {responses.forEach((response)=>{closearray = response.data.map((item : any)=> {return { c : item[4]}}); 
    closearray = closearray.map(x=>bb.nextValue(Number(x.c))).reverse().slice(0,50)
    closearray = closearray.map((item)=>item.upper - item.lower)
    //console.log(closearray);
    
    //setdatalist(closearray)
    let max = closearray[0]
    for (let x of closearray ){if(max<x) max = x;}
    temp.push({pair : String(response.config.url).substring(67), current : closearray[0] ,max : max});
    })
    temp.sort((i,j)=>{if(i.pair < j.pair) return - 1 
      if(i.pair > j.pair) return 1 
      return 0})
      console.log(temp.length);
      
      SetBBscannerobj(temp);
  })
    
    
  
    
  }


  useEffect(()=>{
    getData();
   
    
  },[]);

 useEffect(()=>{ console.log(BBscannerobj.length);},[BBscannerobj])


  return (
    <div><div>{BBscannerobj.map(item=> { if(item.max>item.current *3)
    return <div>{`${item.pair} ==> `}</div>})}</div></div>
  )
}

export default Bollinger