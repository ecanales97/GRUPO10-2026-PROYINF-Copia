import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from 'context/authContext';
import { CreditsProvider } from 'context/creditsContext';

import AppRoutes from 'pages/Router';

// import "flatpickr/dist/themes/material_blue.css";


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CreditsProvider>
                    <AppRoutes/>
                </CreditsProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;