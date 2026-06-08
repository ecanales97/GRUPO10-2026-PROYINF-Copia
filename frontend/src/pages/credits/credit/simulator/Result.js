import { useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Save } from "lucide-react";

import SpinnerGrow from "components/spinners/SpinnerGrow";
import FillContainer from "components/containers/FillContainer";
import SimulationCard from "components/SimulationCard";
import Span from "components/Span";

import useWizard from "context/wizardContext";
import { useAuth } from "context/authContext";

import { useCredit } from "hooks/useCredit";
import { useSimulation } from "hooks/useSimulation";

const Result = () => {
    const {
        token,
        isAuthenticated,
    } = useAuth();

    const {
        setField,
        getFormData,
    } = useWizard();

    const {
        creditType,
    } = useCredit();

    const {
        data,
        loading,
        error,
        fields,
        saveSimulation,
    } = useSimulation({
        formData: getFormData(),
        creditType,
        token,
    });

    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedOption = data?.options?.[selectedIndex] ?? null;

    useEffect(() => {
        if (!data?.options?.length) return;

        setSelectedIndex(0);
        setField("selected", data.options[0]);
    }, [data, setField]);

    const handleSelect = (index) => {
        setSelectedIndex(index);

        setField("selected", data.options[index]);
    };

    if (loading) {
        return (
            <FillContainer>
                <SpinnerGrow
                    className="text-primary"
                    style={{
                        width: "5rem",
                        height: "5rem",
                    }}
                />
            </FillContainer>
        );
    }

    if (error) {
        return (
            <>
                <Span>
                    ERROR: {error}
                </Span>

                <Span>
                    FIELDS:
                    {JSON.stringify(fields)}
                </Span>
            </>
        );
    }

    if (!data) return null;

    return (
        <>
            <Swiper
                className="pb-4"
                style={{
                    width: "100%",
                    "--swiper-pagination-color": "var(--bs-primary)",
                    "--swiper-pagination-bullet-inactive-color": "rgba(var(--bs-secondary-rgb), 0.5)",
                    "--swiper-pagination-bullet-inactive-opacity": "1",
                    "--swiper-pagination-bullet-size": "0.5rem",
                    "--swiper-pagination-bullet-horizontal-gap": "0.5rem",
                    "--swiper-pagination-bullet-border-radius": "0.5rem",
                    "--swiper-pagination-bottom": "-1.5px",
                }}
                modules={[Pagination]}
                pagination={{
                    clickable: true,
                }}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                    768: {slidesPerView: 2,},
                    1024: {slidesPerView: 3,},
                }}
            >
                {data.options.map(
                    (option, index) => (
                        <SwiperSlide
                            key={index}
                        >
                            <SimulationCard
                                data={option}
                                isSelected={selectedIndex === index}
                                onSelect={() => handleSelect(index)}
                                recommended={option.rec ?? ""}
                            />
                        </SwiperSlide>
                    )
                )}
            </Swiper>

            {isAuthenticated &&
                selectedOption && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={async () => {
                            const res = await saveSimulation(selectedOption);

                            if (res.ok) alert("Simulación guardada");
                            else alert(res.error);
                        }}
                    >
                        <Span>
                            <Save
                                size={"1.25rem"}
                                strokeWidth={1.75}
                            />
                            Guardar Simulación
                        </Span>
                    </button>
                )}
        </>
    );
};

export default Result;