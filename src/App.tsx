//import Bollinger from "./Components/BollingerBands"
//import Macd from "./Components/Macd"
import { useState } from "react";
import Bollinger from "./Components/BollingerBands";
import RsiDivergence from "./Components/RsiDivergence";
// import DailyPercent, { MemoizedDailyPercent } from "./Components/DailyPercent"
// // import DailyPercent, { MemoizedDailyPercent } from "./Components/DailyPercent"
// import FuturePairs from "./Components/FuturePairs"
// import TestComponent, {MemoizedTestComponent} from "./Components/testComponent"
// import RateofChange from "./Components/RateofChange"
// import Volume from "./Components/Volume"
// import TestComponent from "./Components/testComponent"

function App() {
  const [indicator, setIndicator] = useState("RSI Divergence");

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

  //let funmemo = useCallback(()=>console.log("prop function"),[])
  return (
    <>
      <h1
        onClick={() => {
          if (indicator == "Bollinger Bands") setIndicator("RSI Divergence");
          else setIndicator("Bollinger Bands");
        }}
      >
        {indicator}
      </h1>

      {indicator == "Bollinger Bands" ? <Bollinger></Bollinger> : null}
      {indicator == "RSI Divergence" ? <RsiDivergence></RsiDivergence> : null}
      {/* <button onClick={()=>setreload(prev=>!prev)}>UpdateState {String(reload)}</button> */}
      {/* <MemoizedTestComponent fun={funmemo}></MemoizedTestComponent> */}
      {/* <MemoizedDailyPercent list={[]}></MemoizedDailyPercent > */}
    </>
  );
}

export default App;
