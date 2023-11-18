import { useEffect, useState } from "react";
import { BollingerBands } from "@debut/indicators";
import useKlineData from "../hooks/useKlineData";
import {
  Stack,
  Button,
  Link,
  Select,
  MenuItem,
  Typography,
  //Checkbox,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { get24hr } from "./GetData";
import { KlineData } from "../hooks/useKlineData";
import FuturePairs from "./FuturePairs";

import { useForm } from "react-hook-form";

type Change = {
  pair: string;
  dailypercent?: number;
  PercentStatusb424hr: "Bullish" | "Bearish";
  dailyIndex?: number;
  green15m: "Yes" | "No";
  b5m: "Yes" | "No";
  b15m: "Yes" | "No";
  b1h: "Yes" | "No";
  b4h: "Yes" | "No";
  b1d: "Yes" | "No";
};

type Inputs = {
  bullish: "Bullish" | "Bearish";
  status24: number;
  dailyRank: number;
  bb: number;
};

function CurrentStatus() {
  const { register, handleSubmit } = useForm<Inputs>();
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setfilter] = useState<Inputs>({
    bullish: "Bullish",
    status24: 6,
    dailyRank: 50,
    bb: 0.8,
  });
  const [data /*timer*/] = useKlineData();

  const [sort, setsort] = useState<{ sortby: string; asc: boolean }[]>([
    {
      sortby: "b5m",
      asc: true,
    },
    {
      sortby: "b15m",
      asc: true,
    },
    {
      sortby: "b1h",
      asc: true,
    },
    {
      sortby: "StatusB4",
      asc: true,
    },
    {
      sortby: "15green",
      asc: true,
    },
  ]);

  let indexdisplay = 0;

  const [changeinpercent, setchangeinpercent] = useState<Change[]>([]);
  //const [weekly /*setweekly*/] = useState(false);

  function calcBB(
    klinedata: {
      o: number;
      h: number;
      l: number;
      c: number;
      v: number;
    }[],
    pair: string
  ): "Yes" | "No" {
    let bb5mObj = new BollingerBands();
    let bb5mUpper = 0;
    let bb5mLower = 0;
    let temp: {
      lower: number;
      middle: number;
      upper: number;
    } = { lower: 0, middle: 0, upper: 0 };
    for (let x = klinedata.length - 1; x >= 0; x--) {
      temp = bb5mObj.nextValue(klinedata[x].c);
      if (temp) {
        bb5mUpper = temp.upper;
        bb5mLower = temp.lower;
      }
    }

    console.log(
      (klinedata[0].c - bb5mLower) / (bb5mUpper - bb5mLower),
      pair,
      temp
    );
    //console.log(klinedata, pair);

    if ((klinedata[0].c - bb5mLower) / (bb5mUpper - bb5mLower) > 0.8)
      return "Yes";
    else return "No";
  }
  function generateChange(data: KlineData[]) {
    let temparray: Change[] = [];

    get24hr().then((dailydata) => {
      //console.log(data);

      temparray = FuturePairs.map((item) => {
        let klinedata = data
          .filter((item) => item.timeframe == "5m")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        //5minute Volume CAlc
        //let sum5mv = 0;
        let b5m = calcBB(klinedata, item);

        //15 minute Volume CAlc
        let b15m: "Yes" | "No" = "No";

        klinedata = data
          .filter((item) => item.timeframe == "15m")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        b15m = calcBB(klinedata, item);

        let b1h: "Yes" | "No" = "No";
        let b4h: "Yes" | "No" = "No";
        let b1d: "Yes" | "No" = "No";

        //1 hour Volume CAlc

        klinedata = data
          .filter((item) => item.timeframe == "1h")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        b1h = calcBB(klinedata, item);

        //Calculating last6 hours status
        let PercentStatusb424hr: "Bullish" | "Bearish" = "Bearish";
        let high46h = 0;
        klinedata.slice(24 - 1 * filter.status24, 24).forEach((item) => {
          if (high46h < item.c) high46h = item.c;
        });

        if (klinedata[0].c > high46h * 0.99) PercentStatusb424hr = "Bullish";
        //console.log(sum1hv / 25, klinedata, item);

        //4 hour Volume CAlc
        klinedata = data
          .filter((item) => item.timeframe == "4h")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        b4h = calcBB(klinedata, item);

        //1 Day Volume CAlc

        klinedata = data
          .filter((item) => item.timeframe == "1d")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        b1d = calcBB(klinedata, item);
        let sortedDaily = dailydata.sort(
          (
            i: { priceChangePercent: number },
            j: { priceChangePercent: number }
          ) => {
            if (i.priceChangePercent > j.priceChangePercent) return -1;
            else if (i.priceChangePercent < j.priceChangePercent) return 1;
            return 0;
          }
        );
        let green15m: "Yes" | "No" =
          klinedata[0].c > klinedata[0].o ? "Yes" : "No";
        return {
          pair: item,
          dailyIndex: sortedDaily.findIndex((find) => find.pair == item) + 1,
          dailypercent: dailydata.filter((item24) => item24.pair == item)[0]
            .priceChangePercent,
          PercentStatusb424hr,
          b15m,
          b1h,
          b4h,
          b1d,
          b5m,
          green15m,
        };
      });
      //console.log(temparray);
      for (let x of sort) {
        temparray = sortData(x, temparray);
      }
      setchangeinpercent(temparray);
    });
  }
  function sortData(
    sort: {
      sortby: string;
      asc: boolean;
    },
    unsorted: Change[]
  ) {
    let sorted: Change[] = [];

    if (sort.sortby == "daily") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.dailypercent != undefined && j.dailypercent != undefined) {
            if (i.dailypercent > j.dailypercent) return -1;
            else return 1;
          } else return -1;
        });
        sorted = sorted.map((item, index) => {
          return { ...item, dailyIndex: index + 1 };
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.dailypercent != undefined && j.dailypercent != undefined) {
            if (i.dailypercent < j.dailypercent) return -1;
            else return 1;
          } else return -1;
        });
      }
    }

    if (sort.sortby == "StatusB4") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.PercentStatusb424hr > j.PercentStatusb424hr) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.PercentStatusb424hr < j.PercentStatusb424hr) return -1;
          else return 1;
        });
      }
    }
    if (sort.sortby == "b1h") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.b1h > j.b1h) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.b1h < j.b1h) return -1;
          else return 1;
        });
      }
    }
    if (sort.sortby == "b5m") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.b5m > j.b5m) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.b5m < j.b5m) return -1;
          else return 1;
        });
      }
    }
    if (sort.sortby == "b15m") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.b15m > j.b15m) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.b15m < j.b15m) return -1;
          else return 1;
        });
      }
    }

    if (sort.sortby == "15green") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.green15m > j.green15m) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.green15m < j.green15m) return -1;
          else return 1;
        });
      }
    }
    return sorted;
  }
  useEffect(() => {
    //console.log(sort);

    let temp = [...changeinpercent];
    for (let x of sort) {
      temp = sortData(x, changeinpercent);
    }
    setchangeinpercent(temp);
  }, [sort]);
  //UseEffect for daily percentagechane
  useEffect(() => {
    if (data.length != 0) {
      generateChange(data);
    } else {
      //console.log("data.lenth is zero");
    }
  }, [data, filter]);

  function setSortState(sortbydata: string) {
    let temp = [...sort];
    let index = temp.findIndex((item) => item.sortby == sortbydata);

    if (index != -1) {
      let item = temp[index];
      temp = temp.filter((item1) => item1.sortby != sortbydata);
      //console.log();

      temp.push({
        sortby: item.sortby,
        asc: index == temp.length ? !item.asc : true,
      });
    } else {
      temp.push({
        sortby: sortbydata,
        asc: true,
      });
    }
    setsort(temp);
  }
  const onSubmit = (data: Inputs) => {
    console.log(data);
    setfilter({
      status24: Number(data.status24),
      bullish: data.bullish,
      dailyRank: Number(data.dailyRank),
      bb: data.bb,
    });
  };
  return (
    <>
      {/* <p>{timer}</p> */}

      <Button
        onClick={() => setShowFilter(!showFilter)}
        variant={showFilter == true ? "contained" : "outlined"}
      >
        {showFilter == true ? "HideFilters" : "Show Filters"}
      </Button>
      {showFilter && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack
            justifyContent={"center"}
            display={"flex"}
            spacing={2}
            direction={"row"}
            alignItems={"center"}
          >
            <Typography>Market Status</Typography>
            <Select
              defaultValue={filter.bullish}
              label="Filter Market"
              {...register("bullish", { required: true })}
            >
              <MenuItem value="Bullish">Bullish</MenuItem>
              <MenuItem value="Bearish">Bearish</MenuItem>
            </Select>
            <Typography>Daily Rank</Typography>
            <Select
              defaultValue={filter.dailyRank}
              {...register("dailyRank", { required: true })}
            >
              <MenuItem value="50">50</MenuItem>
              <MenuItem value="70">70</MenuItem>
              <MenuItem value="100">100</MenuItem>
            </Select>
            <Typography>Statusb4-24</Typography>
            <Select
              defaultValue={filter.status24}
              {...register("status24", { required: true })}
            >
              <MenuItem value="6">6</MenuItem>
              <MenuItem value="4">4</MenuItem>
              <MenuItem value="2">2</MenuItem>
            </Select>
            <Typography>BB%</Typography>
            <Select
              defaultValue={filter.bb}
              {...register("bb", { required: true })}
            >
              <MenuItem value="0.6">0.6</MenuItem>
              <MenuItem value="0.7">0.6</MenuItem>
              <MenuItem value="0.8">0.6</MenuItem>
              <MenuItem value="0.9">0.9</MenuItem>
              <MenuItem value="1">1</MenuItem>
            </Select>
            <Button type="submit" color="primary" variant={"contained"}>
              Filter
            </Button>
          </Stack>
        </form>
      )}

      <Stack>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Index</TableCell>
                <TableCell align="center">Pair</TableCell>
                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("StatusB4");
                  }}
                >
                  <Button variant={"contained"}>StatusB4[24hr]</Button>
                </TableCell>
                <TableCell align="center">DailyIndex</TableCell>
                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("daily");
                  }}
                >
                  {" "}
                  <Button variant={"contained"}>DailyBinance %</Button>
                </TableCell>
                <TableCell align="center">4h Green</TableCell>

                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("b5m");
                  }}
                >
                  <Button variant={"contained"}>5mVolMA</Button>
                </TableCell>
                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("b15m");
                  }}
                >
                  <Button variant={"contained"}>15mVolMA</Button>
                </TableCell>
                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("b1h");
                  }}
                >
                  <Button variant={"contained"}>1hVolMA</Button>
                </TableCell>
                <TableCell align="center">4hVolMA</TableCell>
                <TableCell align="center">1DVolMA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {changeinpercent.map((item) => {
                if (item.pair == "BTCUSDT") console.log(filter, "FilterState");

                if (
                  item.PercentStatusb424hr == filter.bullish &&
                  item.dailyIndex != null
                    ? item.dailyIndex < filter.dailyRank
                    : false
                )
                  return (
                    <TableRow key={item.pair}>
                      <TableCell align="center">{++indexdisplay}</TableCell>
                      <TableCell align="center">
                        {
                          <Link
                            href={`https://www.tradingview.com/chart/V7sMPZg2/?symbol=BINANCE:${item.pair}`}
                            target="_blank"
                            underline="hover"
                          >
                            {item.pair}
                          </Link>
                        }
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={
                            item.PercentStatusb424hr == "Bullish"
                              ? "success"
                              : "error"
                          }
                        >
                          {item.PercentStatusb424hr}
                        </Button>
                      </TableCell>
                      <TableCell align="center">{item.dailyIndex}</TableCell>
                      <TableCell align="center">
                        {item.dailypercent} %
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.green15m == "Yes" ? "success" : "error"}
                        >
                          {item.green15m}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.b5m == "Yes" ? "success" : "error"}
                        >
                          {item.b5m}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.b15m == "Yes" ? "success" : "error"}
                        >
                          {item.b15m}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.b1h == "Yes" ? "success" : "error"}
                        >
                          {item.b1h}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.b4h == "Yes" ? "success" : "error"}
                        >
                          {item.b4h}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.b1d == "Yes" ? "success" : "error"}
                        >
                          {item.b1d}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </>
  );
}

export default CurrentStatus;
