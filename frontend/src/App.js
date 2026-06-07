import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from 'context/authContext';
import { CreditsProvider } from 'context/creditsContext';

import AppRoutes from 'pages/Router';

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