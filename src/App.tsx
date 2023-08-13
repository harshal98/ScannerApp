
//import Bollinger from "./Components/BollingerBands"
//import Macd from "./Components/Macd"
import { useCallback, useMemo, useState } from "react"
import Bollinger from "./Components/BollingerBands"
import DailyPercent, { MemoizedDailyPercent } from "./Components/DailyPercent"
// import DailyPercent, { MemoizedDailyPercent } from "./Components/DailyPercent"
import FuturePairs from "./Components/FuturePairs"
import TestComponent, {MemoizedTestComponent} from "./Components/testComponent"
// import RateofChange from "./Components/RateofChange"
// import Volume from "./Components/Volume"
// import TestComponent from "./Components/testComponent"



function App() {
 
 
 const [reload,setreload]=useState(false)

//  //console.log(reload);
// //  setTimeout(()=>{setreload((prev)=>{ console.log(prev);
// //    return !prev}),50000})
//  useEffect(()=>{
//   console.log(reload);
  
//   // setTimeout(()=>{setreload((prev)=>{ console.log(prev);
//   //  return !prev}),50000})
//  },[reload])
 
  //let memobj =  useMemo(()=>{return FuturePairs.map(item=>{return {pair:item}})},[])

  //let funmemo = useCallback(()=>console.log("prop function"),[])
  return (
    
  <>
      <Bollinger></Bollinger>
      {/* <button onClick={()=>setreload(prev=>!prev)}>UpdateState {String(reload)}</button> */}
      {/* <MemoizedTestComponent fun={funmemo}></MemoizedTestComponent> */}
      {/* <MemoizedDailyPercent list={[]}></MemoizedDailyPercent > */}
</>
   
  )
}

export default App
