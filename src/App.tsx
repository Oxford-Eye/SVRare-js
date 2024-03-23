import * as React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import SVRare from "./components/SVRare";
import Families from "./components/Families";
import IgvPage from "./components/Igv";
//import * as lodash from "lodash";

class App extends React.Component<Object, Object> {
  public render() {
    const baseUrl = "http://localhost:" + process.env.REACT_APP_PATH_SERVER_PORT;
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={<Families baseUrl={baseUrl} />}
            />
            <Route
              path="/patient_sv"
              element={<SVRare baseUrl={baseUrl} />}
            />
            <Route
              path="/igv"
              element={<IgvPage />}
            />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
