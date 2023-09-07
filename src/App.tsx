//import Bollinger from "./Components/BollingerBands"
//import Macd from "./Components/Macd"
//import { useState } from "react";
//import Bollinger from "./Components/BollingerBands";
//import RsiDivergence from "./Components/RsiDivergence";
//import "./App.css";
import CurrentStatus from "./Components/CurrentStatus";
import { Box, Tab } from "@mui/material";
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

  //const [value, setValue] = useState(0);

  // const handleChange = (event: React.SyntheticEvent, newValue: number) => {
  //   console.log(event);

  //   setValue(newValue);
  // };

  {
    /* return (
    <>
    <CurrentStatus></CurrentStatus>
      
      {/* <div className="item">
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
      {indicator == "RSI Divergence" ? <RsiDivergence></RsiDivergence> : null} */
  }
  {
    /* <button onClick={()=>setreload(prev=>!prev)}>UpdateState {String(reload)}</button> */
  }
  {
    /* <MemoizedTestComponent fun={funmemo}></MemoizedTestComponent> */
  }
  {
    /* <MemoizedDailyPercent list={[]}></MemoizedDailyPercent > */
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Percentage Change" />
        {/* <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="BollingerBands" />
          <Tab label="Rsi Divergence" />
         
        </Tabs> */}
      </Box>
      <CurrentStatus />
      {/* <CustomTabPanel value={value} index={0}>
        <Bollinger />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <RsiDivergence />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        
      </CustomTabPanel> */}
    </Box>
  );
}
// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }
// function CustomTabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </div>
//   );
// }
export default App;
