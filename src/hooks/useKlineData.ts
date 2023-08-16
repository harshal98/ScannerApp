import axios, { AxiosResponse } from "axios";
import FuturePairs from "../Components/FuturePairs";
import { useEffect, useState } from "react";

function useKlineData(
  period: string = "3m",
  limit = 1000
): { pair: string; data: { o: number; h: number; l: number; c: number; v:number }[] }[] {
  {
    const [list, setlist] = useState<
      { pair: string; data: { o: number; h: number; l: number; c: number ; v:number  }[] }[]
    >([]);
    useEffect(() => {
      let responses: Promise<AxiosResponse>[] = [];
      for (let x of FuturePairs) {
        responses.push(
          axios.get(
            `https://api.binance.com/api/v3/klines?interval=${period}&limit=${limit}&symbol=${x}`
          )
        );
      }

      let allList: any[] = [];
      axios.all(responses).then((responses) => {
        responses.forEach((response: AxiosResponse) => {
          let ohlcList: { o: number; h: number; l: number; c: number ; v:number }[] =
            response.data.map((item: any) => {
              return { o: item[1], h: item[2], l: item[3], c: item[4], v: item[5]  };
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
        setlist(allList);
      });
    }, []);

    return list ;
  }
}

export default useKlineData;