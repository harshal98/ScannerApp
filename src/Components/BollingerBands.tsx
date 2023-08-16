import { BollingerBands } from "@debut/indicators";
import { useEffect, useState } from "react";

import { get24hr, getData } from "./GetData";

//import "./Volume.css";
//import "./BollingerBands.css";
import useTimer from "../hooks/useTimer";
type BBscanner = {
  pair: string;
  //bblist : number[];
  max: { upper: number; middle: number; lower: number };
  maxindex: number;
  min: { upper: number; middle: number; lower: number };
  minindex: number;
  percent24?: number;
  current: { upper: number; middle: number; lower: number };
  lastcandlecloseprice: number;
};

function Bollinger() {
  const [reload, setreload] = useTimer(10);
  const [period, setperiod] = useState("1h");
  //const [bbval,setbbval] = useState<any[]>([])
  const [BBscannerobj, SetBBscannerobj] = useState<BBscanner[]>([]);

  async function generateBB(response: any) {
    getData(4, period, 100).then((data) => {
      let closearray: { upper: number; middle: number; lower: number }[] = [];
      let temp: BBscanner[] = [];
      data.forEach((x) => {
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

        //if (x.pair == "RNDRUSDT") console.log(`${x.pair} ==> min`,min,minindex)

        temp.push({
          pair: x.pair,
          min: min,
          max: max,
          maxindex: maxindex,
          minindex: minindex,
          current: closearray[0],
          lastcandlecloseprice: Number(x.data[x.data.length - 2]),
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
          return -1;
        else return 1;
        return 0;
      });

      SetBBscannerobj(temp);
    });
  }

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

  //  useEffect(()=>//console.log(BBscannerobj)
  //  )

  return (
    <div>
      <div style={{ fontSize: "20px", position: "inherit", color: "white" }}>
        {" "}
        Reload in : {reload}
      </div>
      <select
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
      <div className="container">
        <table className="responsive-table">
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
              if (
                item.max.upper - item.max.lower >
                  (item.min.upper - item.min.lower) * 3 &&
                //&& item.max.upper > item.min.upper
                //&& item.max.lower < item.min.lower
                item.minindex < 10 &&
                item.lastcandlecloseprice > item.min.middle
              )
                return (
                  <tr key={item.pair}>
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
