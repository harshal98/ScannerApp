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

function CurrentStatus() {
  const data = useKlineData();

  const weeklydata = useKlineData("1h");
  const [sort, setsort] = useState<{ sortby: string; asc: boolean }>({
    sortby: "price",
    asc: true,
  });
  const [period, setperiod] = useState(19);
  const [changeinpercent, setchangeinpercent] = useState<
    {
      pair: string;
      pchange: number;
      vchange: number;
      high: string;
      low: string;
    }[]
  >([]);
  const [weekly, setweekly] = useState(false);

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
    let temparray: {
      pair: string;
      pchange: number;
      vchange: number;
      high: string;
      low: string;
    }[] = [];

    let p = period;

    if (weekly == true) p = 167;

    temparray = data.map((item) => {
      let pchange = Number(
        ((item.data[0].c / item.data[p].c) * 100 - 100).toFixed(2)
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

      return {
        pair: item.pair,
        pchange,
        high: String(((high / item.data[p].c) * 100 - 100).toFixed(2)),
        low: String(((low / item.data[p].c) * 100 - 100).toFixed(2)),
        vchange: Number(((v0 / v1) * 100).toFixed(2)),
      };
    });

    if (sort.sortby == "price") {
      if (sort.asc == true) {
        temparray = temparray.sort((i, j) => {
          if (i.pchange > j.pchange) return -1;
          else return 1;
        });
      } else {
        temparray = temparray.sort((i, j) => {
          if (i.pchange < j.pchange) return -1;
          else return 1;
        });
      }
    }

    if (sort.sortby == "volumne") {
      if (sort.asc == true) {
        temparray = temparray.sort((i, j) => {
          if (i.vchange > j.vchange) return -1;
          else return 1;
        });
      } else {
        temparray = temparray.sort((i, j) => {
          if (i.vchange < j.vchange) return -1;
          else return 1;
        });
      }
    }

    return temparray;
  }
  //UseEffect for daily percentagechane
  useEffect(() => {
    if (data.length != 0 && weekly == false) {
      setchangeinpercent(generateChange(data));
    } else {
      console.log("data.lenth is zero");
    }
  }, [data, period, sort, weekly]);

  //UseEffect for Weekly percentagechane
  useEffect(() => {
    if (weekly != false) {
      if (weeklydata.length != 0) {
        setchangeinpercent(generateChange(weeklydata, weekly));
      } else {
        console.log("data.lenth is zero");
      }
    }
  }, [weeklydata, weekly, sort]);

  const handlechange = (e: SelectChangeEvent<number>) => {
    //console.log(e.target.value);
    switch (e.target.value.toString()) {
      case "1h":
        setperiod(19);
        break;
      case "4h":
        setperiod(79);
        break;
      case "1d":
        setperiod(479);
        break;
      case "15m":
        setperiod(4);

        break;
      case "5m":
        setperiod(1);
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
                defaultValue={undefined}
              >
                <MenuItem value={"1d"}>1d</MenuItem>
                <MenuItem value={"4h"}>4h</MenuItem>
                <MenuItem value={"1h"}>1h</MenuItem>
                <MenuItem value={"15m"}>15m</MenuItem>
                <MenuItem value={"5m"}>5m</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        <Button
          variant={"contained"}
          onClick={() => setsort({ ...sort, asc: !sort.asc })}
        >
          Sort Gainers
        </Button>

        <Button variant={"contained"} onClick={() => setweekly(!weekly)}>
          Weekly Status
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Pair</TableCell>
              <TableCell
                align="right"
                onClick={() => {
                  setsort({ ...sort, asc: !sort.asc });
                }}
              >
                <Button variant={"contained"}>PriceChange</Button>
              </TableCell>
              <TableCell align="right">High</TableCell>
              <TableCell align="right">Low</TableCell>
              <TableCell
                align="right"
                onClick={() => {
                  setsort({ ...sort, asc: !sort.asc });
                }}
              >
                <Button variant={"contained"}>VolumneChange</Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeinpercent.map((item) => {
              return (
                <TableRow key={item.pair}>
                  <TableCell align="right">{item.pair}</TableCell>
                  <TableCell align="right">{item.pchange} %</TableCell>
                  <TableCell align="right">{item.high} %</TableCell>
                  <TableCell align="right">{item.low} %</TableCell>

                  <TableCell align="right">{item.vchange} </TableCell>
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
