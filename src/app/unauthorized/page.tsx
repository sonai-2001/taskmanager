"use client";

import { Button,  Typography, Container, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Unauthorized = () => {
  const router = useRouter();

  return (
    <ThemeProvider theme={darkTheme}>
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "grey.900",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            401 - Unauthorized Access
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            You do not have permission to view this page.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Unauthorized;
