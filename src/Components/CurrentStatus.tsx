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
      sortby: "price",
      asc: true,
    },
  ]);
  const [period, setperiod] = useState(19);
  const [changeinpercent, setchangeinpercent] = useState<Change[]>([]);
  const [weekly, setweekly] = useState(false);
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
      console.log(data);

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

        let PercentStatusb424hr: "Bullish" | "Bearish" = "Bearish";
        let high46h = 0;

        item.data.slice(360, 480).forEach((item) => {
          if (high46h < item.h) high46h = item.h;
        });

        if (item.data[0].c > high46h * 0.995) PercentStatusb424hr = "Bullish";

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
        };
      });
      console.log(temparray);
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
    console.log(sort);

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
      console.log("data.lenth is zero");
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

  const handlechange = (e: SelectChangeEvent<number>) => {
    //console.log(e.target.value);
    switch (e.target.value.toString()) {
      case "1h":
        setperiod(20);
        break;
      case "4h":
        setperiod(80);
        break;
      case "1d":
        setperiod(480);
        break;
      case "15m":
        setperiod(4);

        break;
      case "5m":
        setperiod(1);
        break;
      case "8h":
        setperiod(160);
        break;
      case "12h":
        setperiod(240);
        break;
    }
  };

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
                defaultValue={0}
              >
                <MenuItem value={"1d"}>1d</MenuItem>
                <MenuItem value={"12h"}>12h</MenuItem>
                <MenuItem value={"8h"}>8h</MenuItem>
                <MenuItem value={"4h"}>4h</MenuItem>
                <MenuItem value={"1h"}>1h</MenuItem>
                <MenuItem value={"15m"}>15m</MenuItem>
                <MenuItem value={"5m"}>5m</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        <Button variant={"contained"} onClick={() => setweekly(!weekly)}>
          Weekly Status
        </Button>
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
                  let temp = [...sort];
                  let item = temp.findIndex(
                    (item) => item.sortby == "StatusB4"
                  );
                  console.log(item);

                  if (item != -1) {
                    temp[item].asc = !temp[item].asc;
                  } else {
                    temp.push({
                      sortby: "StatusB4",
                      asc:
                        sort.filter((item) => item.sortby == "StatusB4")[0] ==
                        undefined
                          ? true
                          : !sort.filter((item) => item.sortby == "StatusB4")[0]
                              .asc,
                    });
                  }
                  setsort(temp);
                }}
              >
                <Button variant={"contained"}>StatusB4[24hr]</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  let temp = [...sort];
                  let item = temp.findIndex((item) => item.sortby == "daily");
                  console.log(item);

                  if (item != -1) {
                    temp[item].asc = !temp[item].asc;
                  } else {
                    temp.push({
                      sortby: "daily",
                      asc:
                        sort.filter((item) => item.sortby == "daily")[0] ==
                        undefined
                          ? true
                          : !sort.filter((item) => item.sortby == "daily")[0]
                              .asc,
                    });
                  }
                  setsort(temp);
                }}
              >
                {" "}
                <Button variant={"contained"}>DailyBinance %</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  let temp = [...sort];
                  let item = temp.findIndex((item) => item.sortby == "price");
                  console.log(item);

                  if (item != -1) {
                    temp[item].asc = !temp[item].asc;
                  } else {
                    temp.push({
                      sortby: "price",
                      asc:
                        sort.filter((item) => item.sortby == "price")[0] ==
                        undefined
                          ? true
                          : !sort.filter((item) => item.sortby == "price")[0]
                              .asc,
                    });
                  }
                  setsort(temp);
                }}
              >
                <Button variant={"contained"}>PriceChange</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  let temp = [...sort];
                  let item = temp.findIndex((item) => item.sortby == "high");
                  console.log(item);

                  if (item != -1) {
                    temp[item].asc = !temp[item].asc;
                  } else {
                    temp.push({
                      sortby: "high",
                      asc:
                        sort.filter((item) => item.sortby == "high")[0] ==
                        undefined
                          ? true
                          : !sort.filter((item) => item.sortby == "high")[0]
                              .asc,
                    });
                  }
                  setsort(temp);
                }}
              >
                <Button variant={"contained"}>High</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  let temp = [...sort];
                  let item = temp.findIndex((item) => item.sortby == "low");
                  console.log(item);

                  if (item != -1) {
                    temp[item].asc = !temp[item].asc;
                  } else {
                    temp.push({
                      sortby: "low",
                      asc:
                        sort.filter((item) => item.sortby == "low")[0] ==
                        undefined
                          ? true
                          : !sort.filter((item) => item.sortby == "low")[0].asc,
                    });
                  }
                  setsort(temp);

                  setsort(temp);
                }}
              >
                <Button variant={"contained"}>Low</Button>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => {
                  let temp = [...sort];
                  let item = temp.findIndex((item) => item.sortby == "volume");
                  console.log(item);

                  if (item != -1) {
                    temp[item].asc = !temp[item].asc;
                  } else {
                    temp.push({
                      sortby: "volume",
                      asc:
                        sort.filter((item) => item.sortby == "volume")[0] ==
                        undefined
                          ? true
                          : !sort.filter((item) => item.sortby == "volume")[0]
                              .asc,
                    });
                  }
                  setsort(temp);
                }}
              >
                <Button variant={"contained"}>VolumneChange</Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeinpercent.map((item, index) => {
              return (
                <TableRow key={item.pair}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">{item.pair}</TableCell>
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
                  <TableCell align="center">{item.dailypercent} %</TableCell>
                  <TableCell align="center">{item.pchange} %</TableCell>
                  <TableCell align="center">{item.high} %</TableCell>
                  <TableCell align="center">{item.low} %</TableCell>

                  <TableCell align="center">{item.vchange} %</TableCell>
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
