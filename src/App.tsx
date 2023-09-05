//import Bollinger from "./Components/BollingerBands"
//import Macd from "./Components/Macd"
//import { useState } from "react";
import MACDalltimeframe from "./Components/MACDalltimeframe";
//import RsiDivergence from "./Components/RsiDivergence";
import "./App.css";
// import DailyPercent, { MemoizedDailyPercent } from "./Components/DailyPercent"
// // import DailyPercent, { MemoizedDailyPercent } from "./Components/DailyPercent"
// import FuturePairs from "./Components/FuturePairs"
// import TestComponent, {MemoizedTestComponent} from "./Components/testComponent"
// import RateofChange from "./Components/RateofChange"
// import Volume from "./Components/Volume"
// import TestComponent from "./Components/testComponent"

function App() {
  //const [indicator, setIndicator] = useState("Bollinger Bands");

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
    <div className="select">
      <MACDalltimeframe></MACDalltimeframe>
      {/* <div
        className="item"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <p>Bollinger Bands</p>
        <label className="switch">
          <input
            type="checkbox"
            id="cheap"
            onClick={() => {
              if (indicator == "Bollinger Bands")
                setIndicator("RSI Divergence");
              else setIndicator("Bollinger Bands");
            }}
          />

          <span className="slider round"></span>
        </label>
        <p>RSI Divergence</p>
      </div>
      {indicator == "Bollinger Bands" ? <Bollinger></Bollinger> : null}
      {indicator == "RSI Divergence" ? <RsiDivergence></RsiDivergence> : null} */}
      {/* <button onClick={()=>setreload(prev=>!prev)}>UpdateState {String(reload)}</button> */}
      {/* <MemoizedTestComponent fun={funmemo}></MemoizedTestComponent> */}
      {/* <MemoizedDailyPercent list={[]}></MemoizedDailyPercent > */}
    </div>
  );
}

export default App;
