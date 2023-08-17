import axios, { AxiosResponse } from "axios";
import FuturePairs from "./FuturePairs";

//Return an array of object of klines  in form {pair,data[]}
export async function getData(
  index: number,
  period: string = "1d",
  limit = 100
): Promise<{ pair: string; data: string[] }[]> {
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
      let volarray: number[] = response.data.map((item: any) => {
        return Number(item[index]);
      });
      //volarray = volarray
      //console.log(volarray.slice(0,6).reduce((accumulator, currentValue) =>accumulator + currentValue ));

      let volpercent = {
        pair:
          response.config.url != undefined
            ? response.config.url.split("&")[2].substring(7)
            : "",
        data: volarray,
      };
      allList.push(volpercent);
    });

    // allList = allList.sort((i,j)=>{if(i.pair < j.pair) return -1
    //     else return 1
    // return 0})
    return allList;
  });
}

//Return an array of object for daily percentage in form {pair,percentage}
export async function get24hr() {
  return axios
    .get(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=[${FuturePairs.map(
        (item) => `"${item}"`
      )}]`
    )
    .then((resonse: AxiosResponse) => {
      let data: { pair: string; priceChangePercent: number }[] =
        resonse.data.map(
          (item24tick: { symbol: string; priceChangePercent: string }) => {
            return {
              pair: item24tick.symbol,
              priceChangePercent: Number(item24tick.priceChangePercent),
            };
          }
        );
      return data;
    });
}
