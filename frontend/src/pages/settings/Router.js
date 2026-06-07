import { Route, Routes } from "react-router-dom";

import PATH from "config/paths";
import Settings from "./Settings";

const SettingsRouter = () => {
    return (
        <Routes>
            <Route index element={<Settings/>}/>
            <Route path={`${PATH.settings.setting.path}/*`} element={<Settings/>}/>
        </Routes>
    )
}

export default SettingsRouter;