import { BollingerBands } from "@debut/indicators";
import { useEffect, useState } from "react";

import { get24hr, getData } from "./GetData";

// import "./Volume.css";
// import "./BollingerBands.css";
import useTimer from "../hooks/useTimer";
type BBscanner = {
  pair: string;
  max: { upper: number; middle: number; lower: number };
  maxindex: number;
  min: { upper: number; middle: number; lower: number };
  minindex: number;
  percent24?: number;
  current: { upper: number; middle: number; lower: number };
  maxcandlecloseaftermin: number;
  mincandlecloseaftermin: number;
  lastprice: number;

};

function Bollinger() {
  const [reload, setreload] = useTimer(10);
  const [period, setperiod] = useState("1h");
  const [bbfilter, setbbfilter] = useState<string>("Long");
  const [BBscannerobj, SetBBscannerobj] = useState<BBscanner[]>([]);

  async function generateBB(response: any) {
    getData(4, period, 100).then((data) => {
      let temp: BBscanner[] = [];
      data.forEach((x) => {
        let closearray: { upper: number; middle: number; lower: number }[] = [];

        let bb = new BollingerBands(20, 2);

        closearray = x.data
          .map((close) => bb.nextValue(Number(close)))
          .reverse();
        closearray = closearray.slice(0, closearray.length - 19);
        //closearray = closearray.map((item)=> item)

        //if (x.pair == "RNDRUSDT") console.log(`${x.pair}`,closearray);

        //setdatalist(closearray)
        let max = closearray[0];
        let maxindex = 0;
        for (let i = 0; i < closearray.length - 1; i++) {
          if (
            max.upper - max.lower <
            closearray[i].upper - closearray[i].lower
          ) {
            max = closearray[i];
            maxindex = i;
          }
        }

        //if (x.pair == "RNDRUSDT") console.log(`${x.pair} ==> max`,max,maxindex);

        let min = closearray[maxindex];
        let minindex = maxindex;
        for (let i = minindex - 1; i >= 0; i--) {
          if (
            min.upper - min.lower >
            closearray[i].upper - closearray[i].lower
          ) {
            min = closearray[i];
            minindex = i;
          }
        }

        let maxcandlecloseaftermin = 0;
        let closepricearray = x.data.reverse();
        for (let i = 0 + 1; i < minindex; i++) {
          if (maxcandlecloseaftermin < Number(closepricearray[i]))
            maxcandlecloseaftermin = Number(closepricearray[i]);
        }

        let mincandlecloseaftermin = 99999999;
        
        for (let i = 0 + 1; i < minindex; i++) {
          if (mincandlecloseaftermin > Number(closepricearray[i]))
          mincandlecloseaftermin = Number(closepricearray[i]);
        }

        //if (x.pair == "ACHUSDT") console.log(x.data);

        temp.push({
          pair: x.pair,
          min: min,
          max: max,
          maxindex: maxindex,
          minindex: minindex,
          current: closearray[0],
          maxcandlecloseaftermin,
          lastprice: Number(closepricearray[0]),
          mincandlecloseaftermin
        });
      });

      temp = temp.map((itemp) => {
        let p = response.filter((item24: any) => {
          return item24.pair == itemp.pair;
        })[0].priceChangePercent;

        return { ...itemp, percent24: p };
      });

      temp = temp.sort((i, j) => {
        if (
          i.percent24 != undefined && j.percent24 != undefined
            ? i.percent24 > j.percent24
            : false
        )
          return bbfilter == "Long" ? -1 : 1;
        else return bbfilter == "Long" ? 1 : -1;
        return 0;
      });

      SetBBscannerobj(temp);
    });
  }

  useEffect(()=>{
    let temp = [...BBscannerobj]
    temp = temp.sort((i, j) => {
      if (
        i.percent24 != undefined && j.percent24 != undefined
          ? i.percent24 > j.percent24
          : false
      )
        return bbfilter == "Long" ? -1 : 1;
      else return bbfilter == "Long" ? 1 : -1;
      return 0;
    });

    SetBBscannerobj(temp);
  },[bbfilter])
  useEffect(() => {
    setreload();
    let refreshinterval: number = 0;
    get24hr().then((response: any) => {
      generateBB(response);
      refreshinterval = setInterval(() => {
        setreload();
        generateBB(response);
      }, 10000);
    });

    return () => {
      clearInterval(refreshinterval);

      //console.log("const refreshinterval cleared");
    };
  }, [period]);

  // useEffect(() => console.log(BBscannerobj), [BBscannerobj]);
  function filterBB(item: BBscanner) {
    if (bbfilter == "Long") {
      // if (item.pair == "ACHUSDT") {
      //   console.log(item.pair);

      //   console.log(
      //     item.max.upper - item.max.lower >
      //       (item.min.upper - item.min.lower) * 3
      //   );
      //   console.log(Number(item.lastprice) < item.min.upper * 1.01);
      //   console.log(Number(item.lastprice) > item.min.middle, "???");
      //   console.log(item.minindex < 30);
      //   console.log(item.maxcandlecloseaftermin > item.min.upper);
      // }

      if (
        item.max.upper - item.max.lower >
          (item.min.upper - item.min.lower) * 3 &&
        //&& item.max.upper > item.min.upper
        //&& item.max.lower < item.min.lower
        Number(item.lastprice) < item.min.upper * 1.01 &&
        Number(item.lastprice) > item.min.middle &&
        item.minindex < 30 &&
        item.maxcandlecloseaftermin > item.min.upper
      )
        return true;
      else return false;
    }
    if (bbfilter == "Short") {
      if (
        item.max.upper - item.max.lower >
          (item.min.upper - item.min.lower) * 3 &&
        //&& item.max.upper > item.min.upper
        //&& item.max.lower < item.min.lower
        Number(item.lastprice) > item.min.lower * 0.99 &&
        Number(item.lastprice) < item.min.middle &&
        item.minindex < 20 &&
        item.mincandlecloseaftermin < item.min.lower
      )
        return true;
      else return false;
    }
  }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"stretch"}}>
      <div style={{ fontSize: "20px", position: "inherit", color: "black", padding:10, margin:10 }}>
        {" "}
        Reload in : {reload}
      </div>
      <select
      style={{ padding:10, margin:10, width:100 }}
        className="container"
        onChange={(e) => {
          //console.log(e.target.value);

          setperiod(e.target.value.toString());
        }}
        defaultValue={"1h"}
      >
        <option>1d</option>
        <option>4h</option>
        <option>1h</option>
        <option>15m</option>
        <option>5m</option>
      </select>
      <button
        style={{
          width: "100px",
          height: "50px",
          backgroundColor: bbfilter == "Long" ? "#50C878" : "#D03D33",
          border: "0",
        }}
        onClick={() => {
          if (bbfilter == "Long") setbbfilter("Short");
          else setbbfilter("Long");
        }}
      >
        {bbfilter}
      </button>
      </div>
      <div className="container">
        <table className="responsive-table" style={{border:5, borderColor:"black"}}>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Daily%</th>
              <th>MaxIndex</th>
              <th>MinIndex</th>
              <th>BB%</th>
            </tr>
          </thead>
          <tbody>
            {BBscannerobj.map((item) => {
              if (filterBB(item))
                return (
                  <tr key={item.pair} >
                    <td>{item.pair}</td>
                    <td>{item.percent24}</td>
                    <td>{item.maxindex}</td>
                    <td>{item.minindex}</td>
                    <td>
                      {Number(
                        ((item.max.upper - item.max.lower) /
                          (item.min.upper - item.min.lower)) *
                          100
                      ).toFixed(0)}
                    </td>
                    {/* <td>{`${item.lastcandlecloseprice} > ${item.current.middle}`}</td> */}
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Bollinger;
