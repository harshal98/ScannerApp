import { useEffect, useState } from "react";
import useKlineData from "../hooks/useKlineData";
import {
  Stack,
  Button,
  Link,
  Select,
  MenuItem,
  Typography,
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
  vma5m: "Yes" | "No";
  vma15m: "Yes" | "No";
  vma1h: "Yes" | "No";
  vma4h: "Yes" | "No";
  vma1d: "Yes" | "No";
};

type Inputs = {
  bullish: "Bullish" | "Bearish";
  status24: number;
  dailyRank: number;
  v5m: number;
  v15m: number;
  v1h: number;
  v4h: number;
};

function CurrentStatus() {
  const { register, handleSubmit } = useForm<Inputs>();
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setfilter] = useState<Inputs>({
    bullish: "Bullish",
    status24: 6,
    dailyRank: 50,
    v5m: 1,
    v15m: 6,
    v1h: 6,
    v4h: 6,
  });
  const [data /*timer*/] = useKlineData();

  const [sort, setsort] = useState<{ sortby: string; asc: boolean }[]>([
    {
      sortby: "v1h",
      asc: true,
    },
    {
      sortby: "v15m",
      asc: true,
    },
    {
      sortby: "v5m",
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

  function generateChange(data: KlineData[]) {
    let temparray: Change[] = [];

    get24hr().then((dailydata) => {
      //console.log(data);

      temparray = FuturePairs.map((item) => {
        let PercentStatusb424hr: "Bullish" | "Bearish" = "Bearish";
        let high46h = 0;
        let klinedata = data
          .filter((item) => item.timeframe == "5m")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        //5minute Volume CAlc
        let sum5mv = 0;
        let vma5m: "Yes" | "No" = "No";
        for (let i = 0; i < 25; i++) {
          sum5mv = sum5mv + Number(klinedata[i].v);
        }

        let last5mcandleV = klinedata[0].v;
        if (filter.v5m != 1) {
          klinedata.slice(1, 5).forEach((item) => {
            if (item.v > last5mcandleV) last5mcandleV = item.v;
          });
        }
        vma5m = sum5mv / 25 < last5mcandleV ? "Yes" : "No";

        klinedata.slice(287 - 12 * filter.status24, 287).forEach((item) => {
          if (high46h < item.h) high46h = item.h;
        });

        if (klinedata[0].c > high46h * 0.99) PercentStatusb424hr = "Bullish";

        //15 minute Volume CAlc
        let vma15m: "Yes" | "No" = "No";
        let sum15mv = 0;

        klinedata = data
          .filter((item) => item.timeframe == "15m")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        for (let i = 0; i < 25; i++) {
          sum15mv = sum15mv + Number(klinedata[i].v);
        }

        let last15mcandleV = klinedata[0].v;

        let green15m: "Yes" | "No" =
          klinedata[0].c > klinedata[0].o ? "Yes" : "No";

        if (filter.v15m != 1) {
          klinedata.slice(1, 5).forEach((item) => {
            if (item.v > last15mcandleV) last15mcandleV = item.v;
          });
        }

        vma15m = sum15mv / 25 < last15mcandleV ? "Yes" : "No";

        let vma1h: "Yes" | "No" = "No";
        let vma4h: "Yes" | "No" = "No";
        let vma1d: "Yes" | "No" = "No";

        //1 hour Volume CAlc

        klinedata = data
          .filter((item) => item.timeframe == "1h")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        let sum1hv = 0;

        for (let i = 0; i < 25; i++) {
          sum1hv = sum1hv + Number(klinedata[i].v);
        }

        let last1hcandleV = klinedata[0].v;
        if (filter.v1h != 1) {
          klinedata.slice(1, 5).forEach((item) => {
            if (item.v > last1hcandleV) last1hcandleV = item.v;
          });
        }

        vma1h = sum1hv / 25 < last1hcandleV ? "Yes" : "No";

        //console.log(sum1hv / 25, klinedata, item);

        //4 hour Volume CAlc
        klinedata = data
          .filter((item) => item.timeframe == "4h")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        let sum4hv = 0;

        for (let i = 0; i < 25; i++) {
          sum4hv = sum4hv + Number(klinedata[i].v);
        }

        let last4hVol = klinedata[0].v;

        if (filter.v4h != 1) {
          klinedata.slice(1, 5).forEach((item) => {
            if (item.v > last4hVol) last4hVol = item.v;
          });
        }

        vma4h = sum4hv / 25 < last4hVol ? "Yes" : "No";

        //1 Day Volume CAlc
        let sum1dv = 0;

        klinedata = data
          .filter((item) => item.timeframe == "1d")[0]
          .kline.filter((klineitem) => klineitem.pair == item)[0].data;

        for (let i = 0; i < 25; i++) {
          sum1dv = sum1dv + Number(klinedata[i].v);
        }

        let lastcandelvol = klinedata[0].v;

        vma1d = sum1dv / 25 < lastcandelvol ? "Yes" : "No";
        //console.log(item.pair, sum1dv / 25, lastcandelvol, "1D");
        let sortedDaily = dailydata.sort((i, j) => {
          if (i.priceChangePercent > j.priceChangePercent) return -1;
          else if (i.priceChangePercent < j.priceChangePercent) return 1;
          return 0;
        });
        return {
          pair: item,
          dailyIndex: sortedDaily.findIndex((find) => find.pair == item) + 1,
          dailypercent: dailydata.filter((item24) => item24.pair == item)[0]
            .priceChangePercent,
          PercentStatusb424hr,
          vma15m,
          vma1h,
          vma4h,
          vma1d,
          vma5m,
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
    if (sort.sortby == "v1h") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.vma1h > j.vma1h) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.vma1h < j.vma1h) return -1;
          else return 1;
        });
      }
    }
    if (sort.sortby == "v5m") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.vma5m > j.vma5m) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.vma5m < j.vma5m) return -1;
          else return 1;
        });
      }
    }
    if (sort.sortby == "v15m") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.vma15m > j.vma15m) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.vma15m < j.vma15m) return -1;
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
    setfilter({
      status24: Number(data.status24),
      bullish: data.bullish,
      v15m: Number(data.v15m),
      v1h: Number(data.v1h),
      dailyRank: Number(data.dailyRank),
      v4h: Number(data.v4h),
      v5m: Number(data.v5m),
    });
    console.log(data);
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
            <Typography>5mVol</Typography>
            <Select
              defaultValue={filter.v5m}
              {...register("v5m", { required: true })}
            >
              <MenuItem value="6">6</MenuItem>
              <MenuItem value="1">1</MenuItem>
            </Select>
            <Typography>15mVol</Typography>
            <Select
              defaultValue={filter.v15m}
              {...register("v15m", { required: true })}
            >
              <MenuItem value="6">6</MenuItem>
              <MenuItem value="1">1</MenuItem>
            </Select>
            <Typography>1hVol</Typography>
            <Select
              defaultValue={filter.v1h}
              {...register("v1h", { required: true })}
            >
              <MenuItem value="6">6</MenuItem>
              <MenuItem value="1">1</MenuItem>
            </Select>
            <Typography>4hVol</Typography>
            <Select
              defaultValue={filter.v4h}
              {...register("v4h", { required: true })}
            >
              <MenuItem value="6">6</MenuItem>
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
                <TableCell align="center">15m Green</TableCell>

                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("v5m");
                  }}
                >
                  <Button variant={"contained"}>5mVolMA</Button>
                </TableCell>
                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("v15m");
                  }}
                >
                  <Button variant={"contained"}>15mVolMA</Button>
                </TableCell>
                <TableCell
                  align="center"
                  onClick={() => {
                    setSortState("v1h");
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
                          color={item.vma5m == "Yes" ? "success" : "error"}
                        >
                          {item.vma5m}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.vma15m == "Yes" ? "success" : "error"}
                        >
                          {item.vma15m}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.vma1h == "Yes" ? "success" : "error"}
                        >
                          {item.vma1h}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.vma4h == "Yes" ? "success" : "error"}
                        >
                          {item.vma4h}
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={"contained"}
                          color={item.vma1d == "Yes" ? "success" : "error"}
                        >
                          {item.vma1d}
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
