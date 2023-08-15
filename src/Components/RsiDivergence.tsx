import { useEffect, useState } from "react";
import { get24hr, getData } from "./GetData";
import { RSI } from "@debut/indicators";
import "./RsiDivergence.css";
import useTimer from "../hooks/useTimer";

type RsiList = {
  pair: string;
  max1: number;
  max2: number;
  cpmax1: number;
  cpmax2: number;
  max1index: number;
  max2index: number;
  h24percent: number;
};
function RsiDivergence() {
  const [rsilist, setrsilist] = useState<RsiList[]>([]);
  const [period, setperiod] = useState("1h");
  const [data24, setdata24] = useState<
    {
      pair: string;
      priceChangePercent: number;
    }[]
  >([]);

  const { reload, SetTimerRestart } = useTimer(10);

  function getRsi(period: string) {
    getData(4, period, 200).then((data) => {
      let temp: RsiList[] = [];
      data.forEach((item) => {
        const rsi = new RSI(14);
        let closearray = [];

        closearray = item.data.map((x) => {
          return rsi.nextValue(Number(x));
        });
        closearray = closearray.reverse().slice(1, closearray.length - 14);

        let max1 = closearray[0];
        let max1index = 0;
        let datarev = item.data.reverse().slice(1, item.data.length);
        for (let i = 0; i < closearray.length - 1; i++) {
          if (max1 > closearray[i]) {
            max1 = closearray[i];
            max1index = i;
          }
        }

        let max2 = closearray[max1index - 1 - 10];
        let max2index = max1index - 1 - 10;
        for (let i = max2index - 1; i >= 0; i--) {
          if (max2 > closearray[i]) {
            max2 = closearray[i];
            max2index = i;
          }
        }
        let h24percent = data24.filter((item24) => {
          if (item24.pair == item.pair) return true;
        })[0].priceChangePercent;
        temp.push({
          pair: item.pair,
          max1: max1,
          max2: max2,

          cpmax1: Number(datarev[max1index]),
          cpmax2: Number(datarev[max2index]),
          max1index,
          max2index,
          h24percent,
        });
      });

      temp = temp.sort((i, j) => {
        if (i.h24percent < j.h24percent) return 1;
        else return -1;
      });
      console.log(temp);

      setrsilist(temp);
    });
  }

  useEffect(() => {
    get24hr().then((data24) => {
      setdata24(data24);
    });
  }, []);

  useEffect(() => {
    let periodchange = 0;
    if (data24.length != 0) {
      getRsi(period);
      SetTimerRestart();
      periodchange = setInterval(() => {
        getRsi(period);
        SetTimerRestart();
      }, 10000);
    }

    return () => {
      clearInterval(periodchange);
    };
  }, [period, data24]);

  return (
    <div className="container">
      <div> Reload in {reload}</div>
      <select
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
      <table className="rwd-table">
        <tbody>
          <tr>
            <th>Pair</th>
            <th>24Hr%</th>
            <th>RsiMax1</th>
            <th>RsiMax1Index</th>
            <th>RsiMax2</th>
            <th>RsiMax2Index</th>
          </tr>
          {rsilist.map((item) => {
            if (
              item.max1 < 40 &&
              item.max2 > item.max1 &&
              item.cpmax1 > item.cpmax2 &&
              item.max2index < 10
              //item.max1index > 10 + item.max2index //&&
              //item.max1index < item.max2index + 30
            )
              return (
                <tr>
                  <td data-th="Pair">{item.pair}</td>
                  <td data-th="24Hr%">{item.h24percent}</td>
                  <td data-th="RsiMax1">{item.max1}</td>
                  <td data-th="RsiMax1Index">{item.max1index}</td>
                  <td data-th="RsiMax2">{item.max2}</td>
                  <td data-th="RsiMax2Index">{item.max2index}</td>
                </tr>
              );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RsiDivergence;
