import { BollingerBands } from '@debut/indicators'
import { useEffect, useRef, useState } from 'react';


import axios from 'axios';
import FuturePairs from './FuturePairs';
import { get24hr, getData } from './GetData';
import  "./BollingerBands.css"
type BBscanner = {
  pair : string
  //bblist : number[];
  max : number
  current : number
  percent24? : number
}

function Bollinger() {
 
 const timer = useRef(0)  
 const [reload,setreload] = useState(10)
 const [period,setperiod] = useState("1h")
  //const [bbval,setbbval] = useState<any[]>([])
  const [BBscannerobj , SetBBscannerobj] = useState<BBscanner[]>([])

  async function generateBB(response : any){
      
     getData(4,period,100).then((data)=>{ 
       let closearray : any[] = []
       let temp : BBscanner[] = [];
       data.forEach(x =>{        
        
        let bb = new BollingerBands()
        closearray = x.data.map(close=>bb.nextValue(Number(close))).reverse()
        closearray = closearray.slice(0, closearray.indexOf(undefined))
        closearray = closearray.map((item)=>item.upper - item.lower)
        //console.log(closearray);
        
        //setdatalist(closearray)
        let max = closearray[0]
        for (let x of closearray ){if(max<x) max = x;}
        temp.push({pair : x.pair, current : closearray[0] ,max : max });
        })
        
        temp = temp.map((itemp)=>{
            
          let p = response.filter((item24 :any) =>{ return item24.pair == itemp.pair})[0].priceChangePercent
          
         return  { ...itemp,  percent24 : p }
        })
        
  
        temp = temp.sort((i,j)=>{ if(i.percent24 != undefined && j.percent24 != undefined? i.percent24 > j.percent24: false) return -1 
          else return 1 
          return 0})
    
          
          SetBBscannerobj(temp);
         })
         
      
   
  
    
  }


  useEffect(()=>{ 
    let refreshinterval :number = 0
    get24hr().then((response : any)=>{
      generateBB(response)
       refreshinterval =  setInterval(()=>{
            clearInterval(timer.current)
      
            setreload(10)
            generateBB(response)
            timer.current = setInterval(()=>{
                setreload(prev=>prev-1)},1000)
          },10000)
      
      
    })

    return ()=>{
      clearInterval (refreshinterval);
      setreload(10)
      console.log("const refreshinterval cleared");
      }
    
   },[period]);

 


  return (
    
    <div>
      <div style={{fontSize:"20px", position:"inherit"}}> Reload in : {reload}</div>
      <select className='container' onChange={(e)=>
            {   console.log(e.target.value);
            
                setperiod(e.target.value.toString())}} defaultValue={"1d"}>
            <option>1d</option>
            <option>4h</option>
            <option>1h</option>
            <option>15m</option>
            <option>5m</option>
        </select>
      <div className="container" style={{maxWidth:"1000px"}}>
        <table className='responsive-table'>
        <thead>
        <tr>
            <th>Pair</th>
            <th>Daily%</th>
            <th>BB%</th>
        </tr>
        </thead>
        <tbody>
          {BBscannerobj.map(item=> { if(item.max  > item.current *3)
    return <tr><td>{item.pair}</td><td>{item.percent24}</td><td>{Number(item.max/item.current*100).toFixed(0)}</td></tr>})}
    </tbody>
    </table>
    </div>
     
    </div>
  )
}

export default Bollinger