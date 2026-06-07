import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";

import { User, MapPin, CreditCard, Wallet, HandCoins } from 'lucide-react';

import Span from "components/Span";

import PATH from "config/paths";

import Profile from "./Profile";
import Address from "./Address";
import Disbursements from "./Disbursements";
import Income from "./Income";
import Assets from "./Assets";

const SidebarList = ({ sections }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div
            className="d-flex flex-column gap-3"
        >
            {sections?.map((section, sectionIdx) => {
                const { icon, title, items } = section;
                
                return (
                    <div
                        key={sectionIdx}
                        className="d-flex flex-column"
                    >
                        <div
                            className="sidebar-title user-select-none"
                        >
                            <Span>
                                {icon}
                                {title}
                            </Span>
                        </div>
                        {
                            items?.map((item, itemIdx) => {
                                const { icon, label, path } = item;

                                return (
                                    <div
                                        key={itemIdx}
                                        className={`sidebar-item ${location.pathname === path ? "sidebar-item-active" : ""} ${path ? "cursor-pointer" : ""} user-select-none`}
                                        onClick={() => path && navigate(path)}
                                    >
                                        <Span
                                            className="gap-2"
                                        >
                                            {icon}
                                            {label}
                                        </Span>
                                    </div>
                                );
                            })
                        }
                    </div>
                );
            })}
        </div>
    )
};

const SettingsSidebar = ({ sections }) => {
    return (
        <SidebarList sections={sections} />
    )
};

const SettingsContent = ({ sections }) => {
    const location = useLocation();

    const currItem = sections
        .flatMap(section => section.items)
        .find(item => item.path === location.pathname);

    if (!currItem?.content) {
        return (
            <Navigate
                to={PATH.settings.setting.build({ settingType: "perfil" })}
                replace
            />
        );
    }

    return (
        <>
            <h1 className="mt-5 mb-5 display-2 baskervville-italic text-uppercase">{currItem.label}</h1>
            {currItem.content}
        </>
    );
};

const Settings = () => {
    const { settingType } = useParams();

    if (!settingType) {
        return (
            <Navigate
                to={PATH.settings.setting.build({ settingType: "perfil" })}
                replace
            />
        );
    }

    const settingsSections = [
        { title: "Información personal", items: [
                {
                    icon: <User size={"1.125rem"}/>,
                    label: "Perfil",
                    content: <Profile path={PATH.settings.setting.build({ settingType: "perfil" })}/>,
                    path: PATH.settings.setting.build({ settingType: "perfil" })
                },
                {
                    icon: <MapPin size={"1.125rem"}/>,
                    label: "Dirección",
                    content: <Address path={PATH.settings.setting.build({ settingType: "perfil" })}/>,
                    path: PATH.settings.setting.build({ settingType: "direccion" })
                },
            ]
        },
        { title: "Información financiera", items: [
                {
                    icon: <Wallet size={"1.125rem"}/>,
                    label: "Ingresos",
                    content: <Income path={PATH.settings.setting.build({ settingType: "ingresos" })}/>,
                    path: PATH.settings.setting.build({ settingType: "ingresos" })
                },{
                    icon: <HandCoins size={"1.125rem"}/>,
                    label: "Patrimonio",
                    content: <Assets path={PATH.settings.setting.build({ settingType: "patrimonio" })}/>,
                    path: PATH.settings.setting.build({ settingType: "patrimonio" })
                },{
                    icon: <CreditCard size={"1.125rem"}/>,
                    label: "Desembolsos",
                    content: <Disbursements path={PATH.settings.setting.build({ settingType: "desembolsos" })}/>,
                    path: PATH.settings.setting.build({ settingType: "desembolsos" })
                },
            ]
        }
    ];
    
    return (
        <div className="row">
            <div className="col-12 col-md-3">
                <SettingsSidebar sections={settingsSections}/>
            </div>
            <div className="col-12 col-md-9 mb-3">
                <SettingsContent sections={settingsSections}/>
            </div>
        </div>
    )
};

export default Settings;