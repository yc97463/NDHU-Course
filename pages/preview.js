import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import Grid from "@mui/joy/Grid";
import { Box } from "@mui/system";
import Head from "next/head";

export default function ComingSoonPage() {
  return (
    <CssVarsProvider>
      <Head>
        <title>東課西推 Coming Soon</title>
        <meta property="og:image" content="https://i.imgur.com/n9E8PNr.jpg" />
      </Head>

      <Box>
        <img src="https://i.imgur.com/n9E8PNr.jpg" width="100%" />
      </Box>
    </CssVarsProvider>
  );
}
