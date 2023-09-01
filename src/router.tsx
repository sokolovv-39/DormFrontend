import { createBrowserRouter } from "react-router-dom";
import App from "./pages/LoginPage/App"
import PageWrapper from "./pages/PageWrapper/PageWrapper";
import EnrollmentPage from "./pages/EnrollmentPage/EnrollmentPage";
import ConfirmPage from "./pages/ConfirmPage/ConfirmPage";
import FinalPage from "./pages/FinalPage/FinalPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import WrapperComp from "./components/WrapperComp/WrapperComp";

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
        element: <WrapperComp><PageWrapper><FinalPage /></PageWrapper></WrapperComp>
    },
    {
        path: '/admin',
        element: <WrapperComp><PageWrapper><AdminPage /></PageWrapper></WrapperComp>
    }
])