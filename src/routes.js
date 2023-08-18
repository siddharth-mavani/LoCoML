/*!

=========================================================
* Paper Dashboard React - v1.3.2
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Dashboard from "views/Dashboard.js";
import UploadData from "views/UploadData";
import DataPreprocessing from "views/DataPreprocessing";
import Preview from "views/Preview";
import Train from "views/train";

var routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-bank",
    component: <Dashboard />,
  },
  {
    path: "/upload-data",
    name: "Upload Data",
    icon: "nc-icon nc-cloud-upload-94",
    component: <UploadData />,
  },
  {
    path: "/train",
    name: "Train",
    icon: "nc-icon nc-cloud-upload-94",
    component: <Train />,
  },
  // {
  //   path: "/preview",
  //   name: "Preview",
  //   icon: "nc-icon nc-cloud-upload-94",
  //   component: <Preview />,
  //   layout: "/admin",
  // },  
  {
    path: "/data-preprocessing",
    name: "Data Preprocessing",
    icon: "nc-icon nc-tile-56",
    component: <DataPreprocessing />,
  },
];
export default routes;
