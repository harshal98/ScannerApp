//import CurrentStatus from "./Components/CurrentStatus";
import { Box, Button, Tab } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";
import CurrentStatus_V2 from "./Components/CurrentStatus_V2";

function App() {
  const [theme, settheme] = useState<"light" | "dark">("light");
  const darkTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Percentage Change" />
          <Button
            variant="contained"
            onClick={() => settheme(theme == "light" ? "dark" : "light")}
          >
            {theme == "light" ? "Dark Theme" : "Light Theme"}
          </Button>
        </Box>
        <CurrentStatus_V2 />
      </Box>
    </ThemeProvider>
  );
}

export default App;
