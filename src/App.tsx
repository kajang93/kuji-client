import MainLayout from "./components/MainLayout";
import {Header} from "./components/Header";
import {Footer} from "./components/Footer";
import {} from "./App.css";

function App() {
    return (
        <div className="layout">
            <Header />
            <MainLayout />
            <Footer />
        </div>
    );
}

export default App;
