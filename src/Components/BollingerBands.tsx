import { BollingerBands } from "@debut/indicators";
import { useEffect, useState } from "react";

import { get24hr, getData } from "./GetData";
import FuturePairs from "./FuturePairs";
// import "./Volume.css";
import "./BollingerBands.css";
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
  dailyRank?: number;
};

type TableDisplay = {
  pair: string;
  m5: number;
  m15: number;
  h1: number;
  h4: number;
  d1: number;
  daily24percent?: number;
  dailyrank?: number;
};

function Bollinger() {
  const [reload, setreload] = useTimer(10);
  //const [period, setperiod] = useState("1h");
  //const [bbfilter, setbbfilter] = useState<string>("Long");
  const [display, setDisplay] = useState<TableDisplay[]>([]);
  // const [BBscannerobj, SetBBscannerobj] = useState<BBscanner[]>([]);
  let timeframes = ["5m", "15m", "1h", "4h", "1d"];

  async function generateBB(
    response: any[],
    period: string
  ): Promise<BBscanner[]> {
    return getData(4, period, 100).then((data) => {
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
        if (max != undefined) {
          for (let i = 0; i < closearray.length - 1; i++) {
            if (
              max.upper - max.lower <
              closearray[i].upper - closearray[i].lower
            ) {
              max = closearray[i];
              maxindex = i;
            }
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
        for (let i = 0; i <= minindex; i++) {
          if (maxcandlecloseaftermin < Number(closepricearray[i]))
            maxcandlecloseaftermin = Number(closepricearray[i]);
        }

        let mincandlecloseaftermin = 99999999;

        for (let i = 0 + 1; i <= minindex; i++) {
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
          mincandlecloseaftermin,
        });
      });

      temp = temp.map((itemp) => {
        let p = response.filter((item24: any) => {
          return item24.pair == itemp.pair;
        })[0];

        return { ...itemp, percent24: p.priceChangePercent, dailyRank: p.rank };
      });

      temp = temp.sort((i, j) => {
        if (
          i.percent24 != undefined && j.percent24 != undefined
            ? i.percent24 > j.percent24
            : false
        )
          return -1; //bbfilter == "Long" ? -1 : 1;
        else return 1; //bbfilter == "Long" ? 1 : -1;
        return 0;
      });

      return temp;
    });
  }

  // useEffect(() => {
  //   let temp = [...BBscannerobj];
  //   temp = temp.sort((i, j) => {
  //     if (
  //       i.percent24 != undefined && j.percent24 != undefined
  //         ? i.percent24 > j.percent24
  //         : false
  //     )
  //       return bbfilter == "Long" ? -1 : 1;
  //     else return bbfilter == "Long" ? 1 : -1;
  //     return 0;
  //   });

  //   SetBBscannerobj(temp);
  // }, [bbfilter]);

  useEffect(() => {
    setreload();
    let refreshinterval: number = 0;
    get24hr().then((response) => {
      response = response
        .sort((i, j) => {
          if (i.priceChangePercent > j.priceChangePercent) return -1;
          else return 1;
        })
        .map((item, index) => {
          return { ...item, rank: index + 1 };
        });

      let temp = [];
      for (let x of timeframes) {
        temp.push(generateBB(response, x));
      }
      Promise.all(temp).then((res) => {
        console.log(res);
        let tempdisplay: TableDisplay[] = [];
        for (let x of FuturePairs) {
          let pair = x;
          let m5 =
            filterBB(res[0].filter((item) => item.pair == x)[0]) == true
              ? 1
              : 0;
          let m15 =
            filterBB(res[1].filter((item) => item.pair == x)[0]) == true
              ? 1
              : 0;
          let h1 =
            filterBB(res[2].filter((item) => item.pair == x)[0]) == true
              ? 1
              : 0;
          let h4 =
            filterBB(res[3].filter((item) => item.pair == x)[0]) == true
              ? 1
              : 0;
          let d1 =
            filterBB(res[4].filter((item) => item.pair == x)[0]) == true
              ? 1
              : 0;

          tempdisplay.push({
            pair,
            m5,
            m15,
            h1,
            h4,
            d1,
            daily24percent: res[0].filter((item) => item.pair == x)[0]
              .percent24,
            dailyrank: res[0].filter((item) => item.pair == x)[0].dailyRank,
          });
        }
        setDisplay(
          tempdisplay.sort((i, p) => {
            if (i.dailyrank != undefined && p.dailyrank != undefined) {
              if (i.dailyrank > p.dailyrank) return 1;
              else return -1;
            }
            return 0;
          })
        );
      });

      // refreshinterval = setInterval(() => {
      //   setreload();
      //   generateBB(response);
      // }, 10000);
    });

    return () => {
      clearInterval(refreshinterval);

      //console.log("const refreshinterval cleared");
    };
  }, []);

  // useEffect(() => console.log(BBscannerobj), [BBscannerobj]);
  function filterBB(item: BBscanner) {
    if (/*bbfilter == "Long" &&*/ item.max != undefined) {
      // if (period == "1d") {
      //   console.log(item);

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
        // item.max.upper - (item.max.upper - item.max.lower) * 0.61 <
        //   item.min.lower &&
        // item.max.upper - (item.max.upper - item.max.lower) * 0.15 >
        //   item.min.upper &&
        //Number(item.lastprice) < item.min.upper * 1.02 &&
        Number(item.lastprice) > item.min.middle &&
        item.minindex < 25 &&
        item.maxcandlecloseaftermin > item.min.middle // &&
        //item.maxcandlecloseaftermin < item.min.upper * 1.02

        // &&
        // item.percent24 != undefined
        //   ? item.percent24 > 0
        //   : false
      )
        return true;
      else return false;
    }
    // if (bbfilter == "Short") {
    //   if (
    //     item.max.upper - item.max.lower >
    //       (item.min.upper - item.min.lower) * 3 &&
    //     //&& item.max.upper > item.min.upper
    //     //&& item.max.lower < item.min.lower
    //     Number(item.lastprice) > item.min.lower * 0.99 &&
    //     Number(item.lastprice) < item.min.middle &&
    //     item.minindex < 30 &&
    //     item.mincandlecloseaftermin < item.min.lower
    //   )
    //     return true;
    //   else return false;
    // }
    return false;
  }
  return (
    <div>
      <div className="header">
        <div
          style={{
            fontSize: "20px",
            position: "inherit",
            color: "black",
            padding: 10,
            margin: 10,
          }}
        >
          {" "}
          Reload in : {reload}
        </div>
        <table
          className="responsive-table"
          style={{ border: 5, borderColor: "black" }}
        >
          <thead>
            <tr>
              <th>Pair</th>
              <th
                onClick={() => {
                  setDisplay(
                    [...display].sort((i, j) => {
                      if (i.m5 > j.m5) return -1;
                      else return 1;
                    })
                  );
                }}
              >
                5min
              </th>
              <th
                onClick={() => {
                  setDisplay(
                    [...display].sort((i, j) => {
                      if (i.m15 > j.m15) return -1;
                      else return 1;
                    })
                  );
                }}
              >
                15min
              </th>
              <th
                onClick={() => {
                  setDisplay(
                    [...display].sort((i, j) => {
                      if (i.h1 > j.h1) return -1;
                      else return 1;
                    })
                  );
                }}
              >
                1hour
              </th>
              <th
                onClick={() => {
                  setDisplay(
                    [...display].sort((i, j) => {
                      if (i.h4 > j.h4) return -1;
                      else return 1;
                    })
                  );
                }}
              >
                4hour
              </th>
              <th
                onClick={() => {
                  setDisplay(
                    [...display].sort((i, j) => {
                      if (i.d1 > j.d1) return -1;
                      else return 1;
                    })
                  );
                }}
              >
                1D
              </th>
              <th>DailyRank</th>
            </tr>
          </thead>
          <tbody>
            {display.map((item) => {
              let i = item.m5 + item.m15 + item.h4 + item.h1 + item.d1;
              if (i > 1)
                return (
                  <tr key={item.pair}>
                    <td>{item.pair}</td>
                    <td
                      style={{
                        backgroundColor: item.m5 == 1 ? "Yellow" : "inherit",
                      }}
                    >
                      {item.m5 == 1 ? "Yes" : item.m5}
                    </td>
                    <td
                      style={{
                        backgroundColor: item.m15 == 1 ? "Yellow" : "inherit",
                      }}
                    >
                      {item.m15 ? "Yes" : item.m15}
                    </td>
                    <td
                      style={{
                        backgroundColor: item.h1 == 1 ? "Yellow" : "inherit",
                      }}
                    >
                      {item.h1 ? "Yes" : item.h1}
                    </td>
                    <td
                      style={{
                        backgroundColor: item.h4 == 1 ? "Yellow" : "inherit",
                      }}
                    >
                      {item.h4 ? "Yes" : item.h4}
                    </td>
                    <td
                      style={{
                        backgroundColor: item.d1 == 1 ? "Yellow" : "inherit",
                      }}
                    >
                      {item.d1 ? "Yes" : item.d1}
                    </td>
                    <td>{item.dailyrank}</td>
                    <td>
                      {/*(item.max.upper - item.max.lower) /
                          (item.min.upper - item.min.lower)) *
                          100
                      ).toFixed(0)*/}
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
