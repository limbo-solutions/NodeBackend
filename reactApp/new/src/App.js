import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Form from "./assets/form";
import Modal from "./assets/modal";


function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<Form/>}/>
      <Route path="/" element={<Modal/>}/>
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;