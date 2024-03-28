import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import AuthorizationPage from "./pages/AuthorizationPage";
import Layout from "./components/Layout";
import AnalyticsPage from "./pages/AnalyticsPage";
import {ClientPage} from "./pages/ClientPage";
import EmployeesPage from "./pages/EmployeesPage";
import PageNotFound from "./pages/PageNotFound";
import ViewClientPage from "./pages/ViewClientPage";
import ProjectsPage from "./pages/ProjectsPage";
import ViewProjectPage from "./pages/ViewProjectPage";
import IncomesPage from "./pages/IncomesPage";
import ExpensesPage from "./pages/ExpensesPage";
import LeadsPage from "./pages/LeadsPage";
import ViewLeadsPage from "./pages/ViewLeadsPage";
import MiddleWare from "./components/MiddleWare";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import TasksPage from "./pages/TasksPage"
import ViewTasksPage from "./pages/ViewTasksPage";
import TimeSheetsPage from "./pages/TimeSheetsPage";
import ViewEmployeePage from "./pages/ViewEmployeePage";
import PageDeniedPermission from "./pages/PageDeniedPermission";
import {getCookie} from "typescript-cookie";
import {position} from "./https/axiosInstance";
import MainPage from "./pages/MainPage";

function App() {
    const userPosition = getCookie(position)
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="login"
                        element={
                            <MiddleWare>
                                <AuthorizationPage/>
                            </MiddleWare>
                        }
                    />
                    <Route
                        path="/*"
                        element={
                            <MiddleWare>
                                <Layout/>
                            </MiddleWare>
                        }
                    >
                        <Route index path='home' element={
                            typeof userPosition !== 'undefined' && userPosition === 'admin'
                                ? <AnalyticsPage/>
                                : <MainPage/>
                        }/>
                        <Route path="clients" element={<ClientPage/>}/>
                        <Route path="clients/:id" element={<ViewClientPage/>}/>
                        <Route path="employees" element={<EmployeesPage/>}/>
                        <Route path="employees/:id" element={<ViewEmployeePage/>}/>
                        <Route path="projects" element={<ProjectsPage/>}/>
                        <Route path="projects/:id" element={<ViewProjectPage/>}/>
                        <Route path="incomes" element={<IncomesPage/>}/>
                        <Route path="expenses" element={<ExpensesPage/>}/>
                        <Route path="leads" element={<LeadsPage/>}/>
                        <Route path="leads/:id" element={<ViewLeadsPage/>}/>
                        <Route path="tasks" element={<TasksPage/>}/>
                        <Route path="tasks/:id" element={<ViewTasksPage/>}/>
                        <Route path="timeSheets" element={<TimeSheetsPage/>}/>
                        <Route path="*" element={<PageNotFound/>}/>
                        <Route path="denied-permission" element={<PageDeniedPermission/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </LocalizationProvider>
    );
}

export default App;
