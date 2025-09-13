import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Home from "../pages/Home";
import RootLayout from "../Layout/RootLayout";
import Umrah from "../pages/Umrah";
import TawafScene from "../scenes/TawafScene";
import SaiScene from "../scenes/SaiScene";
import Haj from "../pages/haj";
import BeforeUmrah from "../pages/BeforeUmrah";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="umrah" element={<Umrah />} />
        <Route path="Haj" element={<Haj />} />
        <Route path="umrah/beforeUmrah" element={<BeforeUmrah />} />
        <Route path="umrah/tawaf" element={<TawafScene />} />
        <Route path="umrah/saai" element={<SaiScene />} />
      </Route>
    </>
  )
);

export default router;
