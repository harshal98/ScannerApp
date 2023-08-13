import { useEffect, useMemo, useState } from "react"
//import Bollinger from "./Components/BollingerBands"
//import Macd from "./Components/Macd"
import Bollinger from "./Components/BollingerBands"
import DailyPercent, { MemoizedDailyPercent } from "./Components/DailyPercent"
import FuturePairs from "./Components/FuturePairs"
import RateofChange from "./Components/RateofChange"
import Volume from "./Components/Volume"
import TestComponent from "./Components/testComponent"



function App() {
 
 
//  const [reload,setreload]=useState(false)

//  //console.log(reload);
// //  setTimeout(()=>{setreload((prev)=>{ console.log(prev);
// //    return !prev}),50000})
//  useEffect(()=>{
//   console.log(reload);
  
//   // setTimeout(()=>{setreload((prev)=>{ console.log(prev);
//   //  return !prev}),50000})
//  },[reload])
 
  //let memobj =  useMemo(()=>{return FuturePairs.map(item=>{return {pair:item}})},[])
  return (
    
      <>
      <Bollinger></Bollinger>
      </>
   
  )
}

export default App
