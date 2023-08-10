//import { useEffect, useState } from "react"
//import Bollinger from "./Components/BollingerBands"
//import Macd from "./Components/Macd"
import Volume from "./Components/Volume"


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
 
 
  return (
    <>
     {/* <Macd></Macd> */}
     {/* <Bollinger></Bollinger> */}
     <Volume></Volume>
    </>
  )
}

export default App
