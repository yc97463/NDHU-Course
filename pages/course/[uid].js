import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { Box, Alert } from "@mui/joy";

export default function MyApp() {
  return (
    <CssVarsProvider>
      <Box sx={{ width: "100%" }}>
        <Alert>This is a basic Alert.</Alert>
      </Box>
    </CssVarsProvider>
  );
}
