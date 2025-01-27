
"use client"
import { darkTheme } from "@/helper/theme";
import { ThemeProvider } from "@emotion/react";
import { Container, Typography, Paper, Box } from "@mui/material";

const NormalUser = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <Container
        maxWidth="xl"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome, Normal User
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You currently do not have permission to create projects or tasks.
          </Typography>
          <Box mt={2}>
            <Typography variant="body1" color="error.main">
              An admin needs to add you before you can access these features.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default NormalUser;
