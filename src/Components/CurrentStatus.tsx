import { useEffect, useState } from "react";
import useKlineData from "../hooks/useKlineData";
import {
  Stack,
  Button,
  Select,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Link,
  //Input,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { get24hr } from "./GetData";
type Change = {
  pair: string;
  pchange: number;
  vchange: number;
  high: number;
  low: number;
  dailypercent?: number;
  PercentStatusb424hr: "Bullish" | "Bearish";
  dailyIndex?: number;
  v4h: number;
  v1h: number;
};
function CurrentStatus() {
  const [data, timer] = useKlineData();
  // let weeklydata: {
  //   pair: string;
  //   data: {
  //     o: number;
  //     h: number;
  //     l: number;
  //     c: number;
  //     v: number;
  //   }[];
  // }[] = [];
  const [sort, setsort] = useState<{ sortby: string; asc: boolean }[]>([
    {
      sortby: "daily",
      asc: true,
    },
  ]);
  const [period, setperiod] = useState(19);
  const [changeinpercent, setchangeinpercent] = useState<Change[]>([]);
  const [weekly /*setweekly*/] = useState(false);
  // if (weekly) {
  //   [weeklydata] = useKlineData("1h");
  // }
  function generateChange(
    data: {
      pair: string;
      data: {
        o: number;
        h: number;
        l: number;
        c: number;
        v: number;
      }[];
    }[],
    weekly: boolean = false
  ) {
    let temparray: Change[] = [];

    let p = period;

    if (weekly == true) p = 167;
    get24hr().then((dailydata) => {
      //console.log(data);

      temparray = data.map((item) => {
        let pchange = Number(
          ((item.data[0].c / item.data[p].c) * 100 - 100).toFixed(1)
        );

        let high = 0;

        item.data.slice(0, p + 1).forEach((item) => {
          if (high < item.h) high = Number(item.h);
        });
        //console.log(item.pair, high, item.data);

        let low = 99999999999;

        item.data.slice(0, p + 1).forEach((item) => {
          if (low > item.l) low = Number(item.l);
        });

        let v0 = 0;
        item.data.slice(0, p + 1).forEach((item) => {
          v0 = v0 + Number(item.v);
        });
        let v1 = 0;
        item.data.slice(p + 1, p + 1 + p + 1).forEach((item) => {
          v1 = v1 + Number(item.v);
        });

        let v4h0 = 0;
        item.data.slice(0, 20 * 4 + 1).forEach((item) => {
          v4h0 = v4h0 + Number(item.v);
        });
        let v4h1 = 0;
        item.data.slice(20 * 4 + 1, 20 * 4 + 1 + 20 * 4 + 1).forEach((item) => {
          v4h1 = v4h1 + Number(item.v);
        });

        let v1h0 = 0;
        item.data.slice(0, 20 * 4 + 1).forEach((item) => {
          v1h0 = v1h0 + Number(item.v);
        });
        let v1h1 = 0;
        item.data.slice(20 * 4 + 1, 20 * 4 + 1 + 20 * 4 + 1).forEach((item) => {
          v1h1 = v1h1 + Number(item.v);
        });

        let PercentStatusb424hr: "Bullish" | "Bearish" = "Bearish";
        let high46h = 0;

        item.data.slice(360, 480).forEach((item) => {
          if (high46h < item.h) high46h = item.h;
        });

        if (item.data[0].c > high46h * 0.99) PercentStatusb424hr = "Bullish";

        return {
          pair: item.pair,
          pchange,
          high: Number(((high / item.data[p].c) * 100 - 100).toFixed(1)),
          low: Number(((low / item.data[p].c) * 100 - 100).toFixed(1)),
          vchange: Number(((v0 / v1) * 100).toFixed(2)),
          dailypercent: dailydata.filter(
            (item24) => item24.pair == item.pair
          )[0].priceChangePercent,
          PercentStatusb424hr,
          v4h: Number(((v4h0 / v4h1) * 100).toFixed(2)),
          v1h: Number(((v1h0 / v1h1) * 100).toFixed(2)),
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
    if (sort.sortby == "price") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.pchange > j.pchange) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.pchange < j.pchange) return -1;
          else return 1;
        });
      }
    }

    if (sort.sortby == "volume") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.vchange > j.vchange) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.vchange < j.vchange) return -1;
          else return 1;
        });
      }
    }
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
    if (sort.sortby == "high") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.high > j.high) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.high < j.high) return -1;
          else return 1;
        });
      }
    }
    if (sort.sortby == "low") {
      if (sort.asc == true) {
        sorted = unsorted.sort((i, j) => {
          if (i.low > j.low) return -1;
          else return 1;
        });
      } else {
        sorted = unsorted.sort((i, j) => {
          if (i.low < j.low) return -1;
          else return 1;
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
    if (data.length != 0 && weekly == false) {
      generateChange(data);
    } else {
      //console.log("data.lenth is zero");
    }
  }, [data, period, weekly]);

  //UseEffect for Weekly percentagechane
  // useEffect(() => {
  //   if (weekly != false) {
  //     if (weeklydata.length != 0) {
  //       setchangeinpercent(generateChange(weeklydata, weekly));
  //     } else {
  //       console.log("data.lenth is zero");
  //     }
  //   }
  // }, [weeklydata, weekly]);

  const handlechange = (e: SelectChangeEvent<Number>) => {
    //console.log(e.target.value);
    setperiod(20 * Number(e.target.value));
    // switch (e.target.value.toString()) {
    //   case "1h":
    //     setperiod(20);
    //     break;
    //   case "4h":
    //     setperiod(80);
    //     break;
    //   case "1d":
    //     setperiod(480);
    //     break;
    //   case "15m":
    //     setperiod(4);

    //     break;
    //   case "5m":
    //     setperiod(1);
    //     break;
    //   case "8h":
    //     setperiod(160);
    //     break;
    //   case "12h":
    //     setperiod(240);
    //     break;
    // }
  };
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

  return (
    <Stack>
      <Stack direction={"row"} justifyContent={"center"}>
        {!weekly && (
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Interval</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Interval"
                onChange={handlechange}
                defaultValue={1}
              >
                <MenuItem value={24}>1d</MenuItem>
                <MenuItem value={12}>12h</MenuItem>
                <MenuItem value={8}>8h</MenuItem>
                <MenuItem value={4}>4h</MenuItem>
                <MenuItem value={3}>3h</MenuItem>
                <MenuItem value={2}>2h</MenuItem>
                <MenuItem value={1}>1h</MenuItem>
                <MenuItem value={0.25}>15m</MenuItem>
              </Select>
              {/* <Input
                defaultValue={1}
                onBlur={(e) => {
                  handlechange(e);
                }}
              ></Input> */}
            </FormControl>
          </Box>
        )}

        {/* <Button variant={"contained"} onClick={() => setweekly(!weekly)}>
          Weekly Status
        </Button> */}
      </Stack>
      <p>{timer}</p>
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
              <TableCell
                align="center"
                onClick={() => {
                  setSortState("price");
                }}
              >
                <Button variant={"contained"}>PriceChange</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  setSortState("high");
                }}
              >
                <Button variant={"contained"}>High</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  setSortState("low");
                }}
              >
                <Button variant={"contained"}>Low</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  setSortState("volume");
                }}
              >
                <Button variant={"contained"}>VolumneChange</Button>
              </TableCell>
              <TableCell align="center">Volumne 4h Change</TableCell>
              <TableCell align="center">Volumne 1h Change</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeinpercent.map((item, index) => {
              return (
                <TableRow key={item.pair}>
                  <TableCell align="center">{index + 1}</TableCell>
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
                  <TableCell align="center">{item.dailypercent} %</TableCell>
                  <TableCell align="center">{item.pchange} %</TableCell>
                  <TableCell align="center">{item.high} %</TableCell>
                  <TableCell align="center">{item.low} %</TableCell>

                  <TableCell align="center">{item.vchange} %</TableCell>
                  <TableCell align="center">
                    <Button
                      variant={"contained"}
                      color={item.v4h > 150 ? "success" : "error"}
                    >
                      {item.v4h} %
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant={"contained"}
                      color={item.v1h > 150 ? "success" : "error"}
                    >
                      {item.v1h} %
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export default CurrentStatus;
