import { MACD } from "@debut/indicators";
import { useEffect, useState } from "react";

import { get24hr, getData } from "./GetData";
import FuturePairs from "./FuturePairs";
// import "./Volume.css";
import "./BollingerBands.css";
import useTimer from "../hooks/useTimer";
type MACDScanner = {
  pair: string;
  macdCurrent: {
    macd: number;
    emaFast: number;
    emaSlow: number;
    signal: number;
    histogram: number;
  };

  percent24?: number;
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

function MACDalltimeframe() {
  const [reload, setreload] = useTimer(30);
  //const [period, setperiod] = useState("1h");
  //const [bbfilter, setbbfilter] = useState<string>("Long");
  const [display, setDisplay] = useState<TableDisplay[]>([]);
  // const [MACDScannerobj, SetMACDScannerobj] = useState<MACDScanner[]>([]);
  let timeframes = ["5m", "15m", "1h", "4h", "1d"];

  async function generateMACD(
    response: any[],
    period: string
  ): Promise<MACDScanner[]> {
    return getData(4, period, 200).then((data) => {
      let temp: MACDScanner[] = [];
      data.forEach((x) => {
        let closearray: {
          macd: number;
          emaFast: number;
          emaSlow: number;
          signal: number;
          histogram: number;
        }[] = [];

        let macd = new MACD(12, 26, 9);

        closearray = x.data
          .map((close) => macd.nextValue(Number(close)))
          .reverse();

        closearray = closearray.slice(0, closearray.length - 25);

        //if (x.pair == "RNDRUSDT") console.log(`${x.pair}`,closearray);

        temp.push({
          pair: x.pair,
          macdCurrent: closearray[0],
          lastprice: Number(x.data[x.data.length - 1]),
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
  //   let temp = [...MACDScannerobj];
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

  //   SetMACDScannerobj(temp);
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

      updateDisplayTable(response);

      refreshinterval = setInterval(() => {
        setreload();
        updateDisplayTable(response);
      }, 30000);
    });

    return () => {
      clearInterval(refreshinterval);

      //console.log("const refreshinterval cleared");
    };
  }, []);

  function updateDisplayTable(response: any) {
    let temp = [];
    for (let x of timeframes) {
      temp.push(generateMACD(response, x));
    }
    Promise.all(temp).then((res) => {
      console.log(res);
      let tempdisplay: TableDisplay[] = [];
      for (let x of FuturePairs) {
        let pair = x;
        let m5 =
          filterMacd(res[0].filter((item) => item.pair == x)[0]) == true
            ? 1
            : 0;
        let m15 =
          filterMacd(res[1].filter((item) => item.pair == x)[0]) == true
            ? 1
            : 0;
        let h1 =
          filterMacd(res[2].filter((item) => item.pair == x)[0]) == true
            ? 1
            : 0;
        let h4 =
          filterMacd(res[3].filter((item) => item.pair == x)[0]) == true
            ? 1
            : 0;
        let d1 =
          filterMacd(res[4].filter((item) => item.pair == x)[0]) == true
            ? 1
            : 0;

        tempdisplay.push({
          pair,
          m5,
          m15,
          h1,
          h4,
          d1,
          daily24percent: res[0].filter((item) => item.pair == x)[0].percent24,
          dailyrank: res[0].filter((item) => item.pair == x)[0].dailyRank,
        });
      }
      console.log(tempdisplay);

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
  }
  // useEffect(() => console.log(MACDScannerobj), [MACDScannerobj]);
  function filterMacd(item: MACDScanner) {
    if (item.macdCurrent) {
      if (
        // item.macdCurrent.macd > 0 &&
        // item.macdCurrent.signal > 0 &&
        item.macdCurrent.macd > item.macdCurrent.signal /*&&
        item.macdCurrent.macd < item.macdCurrent.signal * 1.02*/
      )
        return true;
    } else return false;

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
    // return false;
  }

  return (
    <div>
      <div className="header">
        <div
          style={{
            fontSize: "20px",

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
              <th>Daily%</th>
            </tr>
          </thead>
          <tbody>
            {display.map((item) => {
              let i = item.m5 + item.m15 + item.h4 + item.h1 + item.d1;
              if (i > 0)
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
                    <td>
                      {
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <div
                            style={{
                              border: "2px groove blue",
                              marginRight: "50px",
                              padding: "10px",
                            }}
                          >
                            {item.dailyrank}
                          </div>
                          <div
                            style={{
                              border: "2px groove blue",
                              padding: "10px",
                            }}
                          >
                            {item.daily24percent}
                          </div>
                        </div>
                      }
                    </td>
                    {/* <td>
                      (item.max.upper - item.max.lower) /
                          (item.min.upper - item.min.lower)) *
                          100
                      ).toFixed(0)
                    </td> */}
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

export default MACDalltimeframe;
