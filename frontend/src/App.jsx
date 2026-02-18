import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? <Dashboard /> : <Login />;
}

export default App;
