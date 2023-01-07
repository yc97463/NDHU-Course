import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import { Alert, Button, Divider, Link, Typography } from "@mui/joy";
import Grid from "@mui/joy/Grid";
import { Box } from "@mui/system";
import Head from "next/head";

export default function ComingSoonPage() {
  return (
    <CssVarsProvider>
      <Head>
        <title>東課西推 Coming Soon</title>
        <meta property="og:image" content="https://i.imgur.com/XuaIbwv.png" />
      </Head>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item>
          <Typography level="h1">東課西推 Coming Soon</Typography>
          <Box>
            <Divider orientation="horizontal">Any ideas?</Divider>

            <Alert>
              <Button variant="solid">Contact us</Button>&emsp;
              <Link href="mailto:ndhu-course@googlegroups.com">
                ndhu-course@googlegroups.com
              </Link>
            </Alert>
          </Box>
        </Grid>
      </Grid>
    </CssVarsProvider>
  );
}
