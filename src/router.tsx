import { createBrowserRouter } from "react-router-dom";
import App from "./pages/LoginPage/App"
import PageWrapper from "./pages/PageWrapper/PageWrapper";
import EnrollmentPage from "./pages/EnrollmentPage/EnrollmentPage";
import ConfirmPage from "./pages/ConfirmPage/ConfirmPage";
import FinalPage from "./pages/FinalPage/FinalPage";
import AdminPage from "./pages/AdminPage/AdminPage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />
    },
    {
        path: '/enrollment',
        element: <PageWrapper><EnrollmentPage /></PageWrapper>
    },
    {
        path: '/confirmation',
        element: <PageWrapper><ConfirmPage /></PageWrapper>
    },
    {
        path: '/registered',
        element: <PageWrapper><FinalPage /></PageWrapper>
    },
    {
        path: '/admin',
        element: <PageWrapper><AdminPage /></PageWrapper>
    }
])