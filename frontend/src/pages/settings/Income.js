import { useNavigate } from 'react-router-dom';

import Container, { ContainerRow } from "components/containers/Container";
import DeclarationRenderer from 'components/DeclarationRenderer';
import Span from "components/Span";

import { useCatalogs } from "hooks/useCatalogs";
import { useFetch } from "hooks/useFetch";

import { parseMoneyStringMoney } from "utils/parsers";

import PATH from 'config/paths';

const Income = ({ path }) => {
    const navigate = useNavigate();
    const { catalogs } = useCatalogs();

    const {
        loading:loadingEmployments,
        error:errorEmployments,
        data:employments,
        run:getEmployments,
    } = useFetch({
        path: "/me/employment",
        method: "GET",
        credentials: "include",
        immediate: true,
    });

    const {
        loading:loadingIncomes,
        error:errorIncomes,
        data:incomes,
        run:getIncomes,
    } = useFetch({
        path: "/me/income",
        method: "GET",
        credentials: "include",
        immediate: true,
    });

    const deleteData = useFetch({
        method: "DELETE",
        credentials: "include",
        immediate: false,
    });

    const Title = ({ children }) => (
        <h1 className="baskervville-regular">
            {children}
        </h1>
    );

    const EmploymentsRenderer = ({ employments, loading, error }) => (
        <DeclarationRenderer
            items={employments}
            loading={loading}
            error={error}
            renderHeader={(employment) => (
                <Span className="text-uppercase ibm-plex-mono-regular">
                    {catalogs.jobTypes.find(obj => obj.value === String(employment.jobtypeid))?.label}
                </Span>
            )}
            renderDetails={(employment) => (
                <ContainerRow>
                    <Span className="small">Salario declarado:</Span>
                    <Span className="small">{parseMoneyStringMoney(Number(employment.salary))}</Span>
                </ContainerRow>
            )}
            actions={({ loading }) => (
                <button
                    className="btn btn-primary px-3 py-2"
                    onClick={() =>
                        !loading &&
                        navigate(`${PATH.declarations.declaration.build({ declarationType: "salario" })}?redirectTo=${path}`)
                    }
                >
                    <ContainerRow className={loading ? "placeholder-wave" : ""}>
                        <Span className={loading ? "bg-body rounded-pill placeholder col-12" : ""}>
                            {loading ? "cargando" : "Declarar salario"}
                        </Span>
                    </ContainerRow>
                </button>
            )}
            options={[
                { label: "Eliminar", onClick: async ({ item } = {}) => {
                    const res = await deleteData.run({
                        path: `/me/employment/${item.id}`,
                    });
                    if (res?.ok) await getEmployments();
                } }
            ]}
        />
    );


    console.log(incomes);
    const IncomesRenderer = ({ incomes, loading, error }) => (
        <DeclarationRenderer
            items={incomes}
            loading={loading}
            error={error}
            renderHeader={(income) => (
                <Span className="text-uppercase ibm-plex-mono-regular">
                    {catalogs.incomeTypes.find(obj => obj.value === String(income.incometypeid))?.label}
                </Span>
            )}
            renderDetails={(income) => (
                <ContainerRow>
                    <Span className="small">Ingreso mensual declarado:</Span>
                    <Span className="small">{parseMoneyStringMoney(Number(income.monthlyincome))}</Span>
                </ContainerRow>
            )}
            actions={({ loading }) => (
                <button
                    className="btn btn-primary px-3 py-2"
                    onClick={() =>
                        !loading &&
                        navigate(`${PATH.declarations.declaration.build({ declarationType: "ingreso" })}?redirectTo=${path}`)
                    }
                >
                    <ContainerRow className={loading ? "placeholder-wave" : ""}>
                        <Span className={loading ? "bg-body rounded-pill placeholder col-12" : ""}>
                            {loading ? "cargando" : "Declarar ingreso"}
                        </Span>
                    </ContainerRow>
                </button>
            )}
            options={[
                { label: "Eliminar", onClick: async ({ item } = {}) => {
                    const res = await deleteData.run({
                        path: `/me/income/${item.id}`,
                    });
                    if (res?.ok) await getIncomes();
                } }
            ]}
        />
    );

    return (
        <Container>
            <Container>
                <Span>
                    Puedes crear, modificar o eliminar declaraciones cuando quieras.
                </Span>
                <Span>
                    Esta información sera procesada y verificada. Mientras mas completa sea la información que declares, más rapida sera la verificación.
                </Span>

                <br/>

                <Title>Salario</Title>
                <Span>
                    Registra tu sueldo correspondiente a tu empleo principal.
                </Span>

                <EmploymentsRenderer employments={employments} loading={loadingEmployments} error={errorEmployments} />

                <br/>

                <Title>Ingresos Extra</Title>
                <Span>
                    Incluye aquí todos los ingresos complementarios a tu salario, ya sean permanentes u ocasionales.
                </Span>

                <IncomesRenderer incomes={incomes} loading={loadingIncomes} error={errorIncomes} />
            </Container>
        </Container>
    );
};

export default Income;