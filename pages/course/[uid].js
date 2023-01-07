import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import { Box, Alert } from "@mui/joy";

export default function CourseDetailPage() {
  return (
    <CssVarsProvider>
      <Box sx={{ width: "100%" }}>
        <Alert>This is a basic Alert.</Alert>
      </Box>
    </CssVarsProvider>
  );
}
