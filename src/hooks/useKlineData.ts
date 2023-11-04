import axios, { AxiosResponse } from "axios";
import FuturePairs from "../Components/FuturePairs";
import { useEffect, useRef, useState } from "react";
//import useTimer from "./useTimer";
export type KlineData = {
  timeframe: "5m" | "15m" | "1h" | "4h" | "1d";
  kline: {
    pair: string;
    data: { o: number; h: number; l: number; c: number; v: number }[];

    // data5m: {
    //   time: "5m";
    //   data: { o: number; h: number; l: number; c: number; v: number }[];
    // };
    // data15m: {
    //   time: "15m";
    //   data: { o: number; h: number; l: number; c: number; v: number }[];
    // };
    // data1h: {
    //   time: "1h";
    //   data: { o: number; h: number; l: number; c: number; v: number }[];
    // };
    // data4h: {
    //   time: "4h";
    //   data: { o: number; h: number; l: number; c: number; v: number }[];
    // };
    // data1d: {
    //   time: "1d";
    //   data: { o: number; h: number; l: number; c: number; v: number }[];
    //};
  }[];
};
function useKlineData(/*limit = 1000*/): [list: KlineData[] /*timer: number*/] {
  {
    const clearTimer = useRef(0);
    //const [timer, setTimer] = useTimer(30);
    const [list, setlist] = useState<KlineData[]>([]);

    function getData(
      period: "5m" | "15m" | "1h" | "4h" | "1d",
      limit: number = 25
    ) {
      let responses: Promise<AxiosResponse>[] = [];
      for (let x of FuturePairs) {
        responses.push(
          axios.get(
            `https://api.binance.com/api/v3/klines?interval=${period}&limit=${limit}&symbol=${x}`
          )
        );
      }

      let allList: any[] = [];
      return axios.all(responses).then((responses) => {
        responses.forEach((response: AxiosResponse) => {
          let ohlcList: {
            o: number;
            h: number;
            l: number;
            c: number;
            v: number;
          }[] = response.data.map((item: any) => {
            return {
              o: Number(item[1]),
              h: Number(item[2]),
              l: Number(item[3]),
              c: Number(item[4]),
              v: Number(item[5]),
            };
          });

          //volarray = volarray
          //console.log(volarray.slice(0,6).reduce((accumulator, currentValue) =>accumulator + currentValue ));

          let OhlcPair = {
            pair:
              response.config.url != undefined
                ? response.config.url.split("&")[2].substring(7)
                : "",
            data: ohlcList.reverse(),
          };
          allList.push(OhlcPair);
        });

        allList = allList.sort((i, j) => {
          if (i.pair < j.pair) return -1;
          else return 1;
          return 0;
        });
        return { timeframe: period, kline: allList };
        //setlist(allList);
      });

      //setTimer();
    }
    useEffect(() => {
      getAllTimeFrameData();
      clearTimer.current = setInterval(() => {
        getAllTimeFrameData();
      }, 30000);
      return () => {
        clearInterval(clearTimer.current);
      };
    }, []);

    function getAllTimeFrameData() {
      let Parray = [];
      Parray.push(getData("5m", 300));
      Parray.push(getData("15m"));
      Parray.push(getData("1h"));
      Parray.push(getData("4h"));
      Parray.push(getData("1d"));
      axios.all(Parray).then((responses) => {
        //console.log(responses);
        setlist(responses);
      });
      //setTimer();
    }
    return [list /*timer*/];
  }
}

export default useKlineData;
